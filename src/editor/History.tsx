import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { request, messageOf } from "./ManagementLogin";
import type { Fields } from "./content";
type Row = {
  id: string;
  actor: string;
  date: string;
  action: string;
  count: number;
  pages: string[];
};
function Value({ field }: { field: Fields[string] | undefined }) {
  if (!field) return <p>Website default</p>;
  if (field.kind === "text")
    return (
      <p>
        {field.runs.map((r, i) => (
          <span
            key={i}
            style={{
              whiteSpace: "pre-wrap",
              fontWeight: r.bold ? "bold" : undefined,
              fontStyle: r.italic ? "italic" : undefined,
              textDecoration: r.underline ? "underline" : undefined,
              fontSize:
                r.size === "small"
                  ? ".85em"
                  : r.size === "large"
                    ? "1.25em"
                    : undefined,
            }}
          >
            {r.text}
          </span>
        ))}
      </p>
    );
  if (field.kind === "image")
    return (
      <img
        loading="lazy"
        src={field.url + "?w=240&auto=format"}
        width={240}
        alt="Version image"
      />
    );
  if (field.kind === "copies") return <p>{field.ids.length} duplicate cards</p>;
  if (field.kind === "design") return <p>{Object.keys(field.options).length} design options override the production default.</p>;
  if (field.kind === "order") return <p>{field.ids.length} cards in this order</p>;
  if (field.kind === "selection") return <p>Selected photo {field.index + 1}</p>;
  if (field.kind === "focal") return <p>Crop position {field.x}% across, {field.y}% down</p>;
  if (field.kind === "page") return <p>{field.title} · {field.sections.length} sections · {field.blocks.length} components</p>;
  if (field.kind === "menus") return <p>Navigation and footer settings</p>;
  if (field.kind === "collection") return <p>{field.items.length} entries in {field.type}</p>;
  return (
    <p>
      {field.kind === "visibility"
        ? field.hidden
          ? "Hidden"
          : "Visible"
        : field.kind === "alt"
          ? field.text
          : field.url}
    </p>
  );
}
type VersionDetail = Row & {
  before: Fields;
  after: Fields;
  currentRevision: string | null;
};
function VersionChanges({
  detail,
  busy = false,
  onRestoreField,
}: {
  detail: VersionDetail;
  busy?: boolean;
  onRestoreField?: (key: string) => void;
}) {
  return (
    <>
      {Array.from(
        new Set([...Object.keys(detail.before), ...Object.keys(detail.after)]),
      )
        .filter(
          (k) =>
            detail.action === "snapshot" ||
            JSON.stringify(detail.before[k]) !==
              JSON.stringify(detail.after[k]),
        )
        .map((k) => (
          <details key={k}>
            <summary>{k}</summary>
            <strong>Before</strong>
            <Value field={detail.before[k]} />
            <strong>After</strong>
            <Value field={detail.after[k]} />
            {onRestoreField && (
              <button disabled={busy} onClick={() => onRestoreField?.(k)}>
                Restore field
              </button>
            )}
          </details>
        ))}
    </>
  );
}

export function ActivityChanges({
  session,
  id,
}: {
  session: Session;
  id: string;
}) {
  const [detail, setDetail] = useState<VersionDetail>();
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (detail) return;
    setBusy(true);
    setError("");
    try {
      setDetail(await request(session, { action: "version", id }));
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <button disabled={busy} aria-expanded={open} onClick={toggle}>
        {busy ? "Loading changes…" : open ? "Hide changes" : "View changes"}
      </button>
      {open && detail && (
        <div>
          <p>
            {detail.count} {detail.count === 1 ? "field" : "fields"} ·{" "}
            {detail.pages.map((p) => (p === "/" ? "Home" : p)).join(", ")}
          </p>
          <VersionChanges detail={detail} />
        </div>
      )}
      {open && error && <p role="alert">{error}</p>}
    </div>
  );
}

export default function History({
  session,
  owner = false,
  onRestore,
  onClose,
  onPreview,
}: {
  session: Session;
  owner?: boolean;
  onRestore?: () => void;
  onClose?: () => void;
  onPreview?: (fields: Fields) => void;
}) {
  const [rows, setRows] = useState<Row[]>([]),
    [more, setMore] = useState(false),
    [loaded, setLoaded] = useState(false),
    [dataset, setDataset] = useState(""),
    [search, setSearch] = useState(""),
    [detail, setDetail] = useState<
      Row & { before: Fields; after: Fields; currentRevision: string | null }
    >(),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
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
  async function load(offset = 0) {
    const r = await request(session, { action: "history", offset });
    setDataset(r.dataset);
    setLoaded(true);
    setRows((old) => (offset ? [...old, ...r.rows] : r.rows));
    setMore(r.rows.length === 40);
  }
  useEffect(() => {
    void run(() => load());
  }, [session.user.id]);
  async function restore(side: string, field?: string, page?: string) {
    if (!detail) return;
    const revision = detail.currentRevision;
    if (
      !confirm(
        "Restore " +
          (field || page || "all editor content") +
          " in " +
          dataset +
          "? This publishes a new version.",
      )
    )
      return;
    await request(session, {
      action: "restore",
      id: detail?.id,
      side,
      field,
      page,
      revision,
    });
    setDetail(undefined);
    await load();
    onRestore?.();
    setNotice("Restoration published.");
  }
  return (
    <section className="msa-history" aria-label="Content history">
      <h2>Content history · {dataset}</h2>
      {onClose && <button onClick={onClose}>Close history</button>}
      <button disabled={busy} onClick={() => run(() => load())}>
        Refresh history
      </button>
      <label>
        Search loaded versions by account, date, action or page
        <input value={search} onChange={(e) => setSearch(e.target.value)} />
      </label>
      {owner && (
        <>
          <button
            disabled={busy}
            onClick={() =>
              run(async () => {
                await request(session, { action: "snapshot" });
                await load();
              })
            }
          >
            Create editor snapshot
          </button>
          <button
            disabled={busy}
            onClick={() =>
              run(async () => {
                const data = await request(session, { action: "export" });
                const url = URL.createObjectURL(
                  new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                  }),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = "msa-" + dataset + "-editor.json";
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              })
            }
          >
            Export published website content
          </button>
        </>
      )}
      <ul>
        {rows
          .filter((r) =>
            [r.actor, r.date, r.action, ...r.pages]
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
          .map((r) => (
            <li key={r.id}>
              <button
                disabled={busy}
                onClick={() =>
                  run(async () =>
                    setDetail(
                      await request(session, { action: "version", id: r.id }),
                    ),
                  )
                }
              >
                {new Date(r.date).toLocaleString()} · {r.action} · {r.actor} ·{" "}
                {r.count} fields
              </button>
            </li>
          ))}
      </ul>
      {loaded && !rows.length && !busy && !notice && <p>No recorded versions.</p>}
      {more && (
        <button disabled={busy} onClick={() => run(() => load(rows.length))}>
          Load older versions
        </button>
      )}
      {detail && (
        <article>
          <h3>
            {detail.action} · {new Date(detail.date).toLocaleString()}
          </h3>
          <p>Version {detail.id}</p>
          {onPreview && (
            <button onClick={() => onPreview(detail.after)}>
              Preview on website
            </button>
          )}
          <button disabled={busy} onClick={() => run(() => restore("after"))}>
            Restore this version
          </button>
          {detail.action !== "snapshot" && (
            <button
              disabled={busy}
              onClick={() => run(() => restore("before"))}
            >
              Restore previous state
            </button>
          )}
          {detail.pages.map((p) => (
            <button
              disabled={busy}
              key={p}
              onClick={() => run(() => restore("after", undefined, p))}
            >
              Restore {p}
            </button>
          ))}
          <VersionChanges
            detail={detail}
            busy={busy}
            onRestoreField={(k) => run(() => restore("after", k))}
          />
        </article>
      )}
      <p role="status">{notice}</p>
    </section>
  );
}
