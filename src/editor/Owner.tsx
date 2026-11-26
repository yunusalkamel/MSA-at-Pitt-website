import Reports from "./Reports";
import History, {ActivityChanges} from "./History";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import ManagementLogin, { request, messageOf } from "./ManagementLogin";
import "./owner.css";

type Admin = {
  email: string;
  status: string;
  note: string;
  added_at: string;
  last_sign_in: string | null;
  last_publish: string | null;
};
type Activity = {
  id: number;
  occurred_at: string;
  actor: string;
  action: string;
  subject: string | null;
};
type Overview = {
  environment: string;
  controls: Record<string, boolean>;
  administrators: Admin[];
  activity: Activity[];
  lastPublication: string | null;
};
const controls = [
  [
    "admins_enabled",
    "Administrator access",
    "Allow authorized administrators to open the editor.",
  ],
  [
    "publishing_enabled",
    "Administrator publishing",
    "Allow administrators to publish website changes.",
  ],
  [
    "uploads_enabled",
    "Administrator uploads",
    "Allow administrators to upload replacement images.",
  ],
  [
    "maintenance",
    "Maintenance lock",
    "Pause all content changes, including yours. Public pages stay online.",
  ],
];
const date = (value: string | null) =>
  value ? new Date(value).toLocaleString() : "No activity yet";
const readable = (value: string) => value.replace(/_/g, " ");
export default function Owner() {
  return (
    <ManagementLogin owner>
      {(session) => <Dashboard session={session} />}
    </ManagementLogin>
  );
}
function Dashboard({ session }: { session: Session }) {
  const api = useCallback(
    (action: string, values: object = {}) =>
      request(session, { action, ...values }, "/api/owner"),
    [session],
  );
  const [data, setData] = useState<Overview>(),
    [health, setHealth] = useState<Record<string, string>>();
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState(""),
    [email, setEmail] = useState(""),
    [note, setNote] = useState("");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const sequence = useRef(0);
  async function refresh(term = filter, before?: number) {
    const id = ++sequence.current;
    const next: Overview = await api("overview", { search: term, before });
    if (id === sequence.current)
      setData((old) =>
        before && old
          ? { ...next, activity: [...old.activity, ...next.activity] }
          : next,
      );
    return next.activity.length;
  }
  const [hasMore, setHasMore] = useState(false);
  async function run(task: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  async function load(term = filter, before?: number) {
    setHasMore((await refresh(term, before)) === 75);
  }
  useEffect(() => {
    let live = true;
    api("overview")
      .then((v: Overview) => {
        if (live) {
          setData(v);
          setHasMore(v.activity.length === 75);
        }
      })
      .catch((e) => {
        if (live) setError(messageOf(e));
      });
    api("health")
      .then((v) => {
        if (live) setHealth(v);
      })
      .catch((e) => {
        if (live) setHealth({ Status: messageOf(e) });
      });
    return () => {
      live = false;
    };
  }, [api]);
  async function change(action: string, values: object) {
    await api(action, values);
    await load();
  }
  return (
    <main className="msa-owner">
      <header>
        <div>
          <p>MSA at Pitt</p>
          <h1>Website management</h1>
        </div>
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      </header>
      <nav aria-label="Management sections">
        {[
          "Overview",
          "Administrators",
          "Website controls",
          "Activity",
          "Analytics",
          "System health",
        ].map((label) => (
          <a key={label} href={"#" + label.replace(" ", "-")}>
            {label}
          </a>
        ))}
      </nav>
      <p role="alert">{error}</p>
      {data ? (
        <>
          <section id="Overview">
            <h2>Overview</h2>
            <p>
              <strong>
                {data.environment === "production" ? "Production" : "Preview"}
              </strong>{" "}
              ·{" "}
              {data.administrators.filter((a) => a.status === "active").length}{" "}
              active administrators ·{" "}
              {data.controls.maintenance
                ? "Content locked"
                : "Content unlocked"}
            </p>
            <p>Latest recorded publication · {date(data.lastPublication)}</p>
            <a href="/admin">Open website editor →</a>
          </section>
          <section id="Administrators">
            <h2>Administrators</h2>
            <p>Permanent owner · {session.user.email}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  if (
                    data.administrators.some(
                      (a) => a.email === email.trim().toLowerCase(),
                    )
                  )
                    throw new Error(
                      "This account is already listed. Use its controls below.",
                    );
                  await change("add", { email, note, status: "active" });
                  setEmail("");
                  setNote("");
                });
              }}
            >
              <label>
                Email
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                Internal name or note
                <input
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <button disabled={busy}>Add administrator</button>
            </form>
            {data.administrators.map((a) => (
              <article key={a.email}>
                <h3>{a.email}</h3>
                <p>
                  {a.status} · Added {date(a.added_at)}
                </p>
                <p>
                  Last sign-in · {date(a.last_sign_in)}
                  <br />
                  Last publication · {date(a.last_publish)}
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = new FormData(e.currentTarget).get("note");
                    void run(() =>
                      change("note", { email: a.email, note: text }),
                    );
                  }}
                >
                  <label>
                    Internal note
                    <input name="note" defaultValue={a.note} maxLength={500} />
                  </label>
                  <button disabled={busy}>Save note</button>
                </form>
                {["active", "disabled", "removed"]
                  .filter((s) => s !== a.status)
                  .map((s) => (
                    <button
                      key={s}
                      disabled={busy}
                      onClick={() => {
                        if (
                          s === "removed" &&
                          !window.confirm("Remove access for " + a.email + "?")
                        )
                          return;
                        void run(() =>
                          change("administrator", {
                            email: a.email,
                            status: s,
                          }),
                        );
                      }}
                    >
                      {s === "active"
                        ? "Reinstate"
                        : s === "disabled"
                          ? "Disable"
                          : "Remove"}
                    </button>
                  ))}
              </article>
            ))}
          </section>
          <section id="Website-controls">
            <h2>Website controls</h2>
            {controls.map(([key, label, help]) => (
              <label className="owner-control" key={key}>
                <span>
                  <strong>{label}</strong>
                  <small>{help}</small>
                </span>
                <input
                  type="checkbox"
                  checked={data.controls[key]}
                  disabled={busy}
                  onChange={(e) =>
                    void run(() =>
                      change("control", {
                        control: key,
                        enabled: e.target.checked,
                      }),
                    )
                  }
                />
              </label>
            ))}
          </section>
          <section id="Activity">
            <h2>Activity</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFilter(search);
                void run(() => load(search));
              }}
            >
              <label>
                Search by account, action or subject
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <button disabled={busy}>Search</button>
            </form>
            {data.activity.length ? (
              <ol>
                {data.activity.map((a) => (
                  <li key={a.id}>
                    <strong>{readable(a.action)}</strong> · {a.actor}
                    {a.action==="published" && /^(publish|restore):[a-f0-9-]{36}$/.test(a.subject??"") ? <>
                      {a.subject!.startsWith("restore:") && " · Version restoration"}
                      <ActivityChanges session={session} id={a.subject!.split(":")[1]}/>
                    </> : a.subject && " · " + a.subject}
                    <small>{date(a.occurred_at)}</small>
                  </li>
                ))}
              </ol>
            ) : (
              <p>No matching activity.</p>
            )}
            {hasMore && (
              <button
                disabled={busy}
                onClick={() =>
                  void run(() =>
                    load(filter, data.activity[data.activity.length - 1]?.id),
                  )
                }
              >
                Load earlier activity
              </button>
            )}
          </section>
          <Reports session={session}/><History session={session} owner/>
          <section id="System-health">
            <h2>System health</h2>
            <p>Content dataset · {data.environment}</p>
            {health ? (
              <dl>
                {Object.entries(health).map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p>Checking connections…</p>
            )}
            <button
              disabled={busy}
              onClick={() =>
                void run(async () => setHealth(await api("health")))
              }
            >
              Check again
            </button>
          </section>
        </>
      ) : (
        !error && <p>Loading dashboard…</p>
      )}
    </main>
  );
}
