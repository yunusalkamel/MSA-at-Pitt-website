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
  const [starting, setStarting] = useState(false);
  const [callbackError] = useState(() => {
    const url = new URL(location.href);
    const hash = new URLSearchParams(url.hash.slice(1));
    return url.searchParams.has("error") || hash.has("error")
      ? "Sign-in was canceled or expired. Continue with Google to start again."
      : "";
  });
  const [approved, setApproved] = useState<string | null>(null),
    [error, setError] = useState("");
  async function googleSignIn() {
    setStarting(true);
    setError("");
    try {
      const response = await fetch(
        import.meta.env.VITE_SUPABASE_URL + "/auth/v1/settings",
        {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          cache: "no-store",
        },
      );
      if (!response.ok)
        throw new Error("Sign-in is unavailable. Try again shortly.");
      if (!(await response.json()).external?.google)
        throw new Error(
          "Google sign-in needs to be enabled in this site's Supabase project.",
        );
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: location.origin + (owner ? "/owner" : "/admin"),
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(messageOf(err));
      setStarting(false);
    }
  }
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
        <button disabled={starting} onClick={googleSignIn}>
          {starting ? "Opening Google…" : "Continue with Google"}
        </button>
      )}
      <p role="alert">{error || (!session && callbackError)}</p>
    </main>
  );
}
