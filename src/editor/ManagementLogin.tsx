import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import "./admin.css";
export async function request(
  session: Session,
  body: object,
  endpoint = "/api/site-editor",
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + session.access_token,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.error || "This account could not complete the request.",
    );
  }
  return response.json();
}
export const messageOf = (e: unknown) =>
  e instanceof Error ? e.message : "Something went wrong.";
export default function ManagementLogin({
  children,
  owner = false,
}: {
  children: (session: Session) => ReactNode;
  owner?: boolean;
}) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [approved, setApproved] = useState<string | null>(null),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) =>
      setSession(next),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  const userId = session?.user.id;
  useEffect(() => {
    let live = true;
    setApproved(null);
    setError("");
    if (session)
      request(
        session,
        { action: owner ? "owner_session" : "session" },
        owner ? "/api/owner" : "/api/site-editor",
      )
        .then(() => {
          if (live) setApproved(session.user.id);
        })
        .catch((e) => {
          if (live) setError(messageOf(e));
        });
    return () => {
      live = false;
    };
  }, [userId, owner]);
  if (session && approved === session.user.id) return <>{children(session)}</>;
  return (
    <main className="msa-login">
      <h1>{owner ? "Website owner" : "Site admin"}</h1>
      {session === undefined || (session && !error) ? (
        <p>Checking access…</p>
      ) : session ? (
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            const result = await supabase.auth.signInWithOtp({
              email: email.trim(),
              options: {
                emailRedirectTo:
                  location.origin + (owner ? "/owner" : "/admin"),
              },
            });
            if (result.error) setError(result.error.message);
            else setSent(true);
          }}
        >
          <label>
            Email
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button>Send sign-in link</button>
          {sent && <p>Check your email for the sign-in link.</p>}
        </form>
      )}
      <p role="alert">{error}</p>
    </main>
  );
}
