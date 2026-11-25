import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Content, type Fields, type Field } from "./content";
import { loadContent, type Snapshot } from "./SiteContent";
import { editText } from "./inlineText";
import "./admin.css";

import ManagementLogin, { request, messageOf } from "./ManagementLogin";
export default function Admin({children}: {children: ReactNode}) {
  return <ManagementLogin>{session => <Editor session={session}>{children}</Editor>}</ManagementLogin>;
}

function Editor({
  session,
  children,
}: {
  session: Session;
  children: ReactNode;
}) {
  const [base, setBase] = useState<Snapshot | null>(null),
    [fields, setFields] = useState<Fields>({});
  const draft = useRef<Fields>({}),
    [editing, setEditing] = useState(true),
    [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(""),
    [active, setActive] = useState(false),
    [card, setCard] = useState<{ key: string; scope: string } | null>(null);
  const finish = useRef<() => void>(),
    file = useRef<HTMLInputElement>(null),
    imageKey = useRef("");
  const { pathname } = useLocation();
  const navigate = useNavigate();
  function update(next: Fields) {
    draft.current = next;
    setFields(next);
  }
  function field(key: string, value: Field) {
    update({ ...draft.current, [key]: value });
  }
  useEffect(() => {
    let live = true;
    loadContent()
      .then((s) => {
        if (live) {
          setBase(s);
          update(s.fields);
        }
      })
      .catch((e) => {
        if (live) setNotice(messageOf(e));
      });
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    setCard(null);
  }, [pathname, editing]);
  const dirty = base && fields !== base.fields;
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty || active) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, active]);
  async function upload(key: string, f: File | undefined) {
    if (!f || !key || busy) return;
    if (f.size > 3 * 1024 * 1024) {
      setNotice("Choose an image under 3 MB.");
      return;
    }
    setBusy(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = () => reject(Error("Could not read image."));
        reader.readAsDataURL(f);
      });
      const { url } = await request(session, { action: "image", data });
      field(key, { kind: "image", url });
      setNotice("Image ready to publish.");
    } catch (e) {
      setNotice(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!editing || !base || busy) return;
    function click(e: MouseEvent) {
      const el = e.target instanceof Element ? e.target : null;
      if (!el || el.closest(".msa-tools")) return;
      if (el.closest("[contenteditable=true]")) {
        if (el.closest("a")) e.preventDefault();
        e.stopPropagation();
        return;
      }
      const parent = el.closest<HTMLElement>("[data-edit-card]");
      setCard(
        parent
          ? { key: parent.dataset.editCard!, scope: parent.dataset.copyScope! }
          : null,
      );
      const text = el.closest<HTMLElement>("[data-edit-text]"),
        image = el.closest<HTMLElement>("[data-edit-image]");
      if (!text && !image) return;
      e.preventDefault();
      e.stopPropagation();
      finish.current?.();
      if (image) {
        imageKey.current = image.dataset.editImage!;
        file.current?.click();
        return;
      }
      const key = text!.dataset.editText!,
        prev = draft.current[key],
        original = text!.textContent ?? "";
      const oldRuns = prev?.kind === "text" ? prev.runs : undefined;
      setActive(true);
      finish.current = editText(text!, oldRuns, (runs) => {
        finish.current = undefined;
        setActive(false);
        if (
          JSON.stringify(runs) !==
          JSON.stringify(oldRuns ?? (original ? [{ text: original }] : []))
        )
          field(key, { kind: "text", runs });
      });
    }
    function drop(e: DragEvent) {
      const key = document
        .elementsFromPoint(e.clientX, e.clientY)
        .find((el) => el instanceof HTMLElement && el.dataset.editImage)
        ?.getAttribute("data-edit-image");
      if (!key) return;
      e.preventDefault();
      if (e.type === "drop") {
        e.stopPropagation();
        void upload(key, e.dataTransfer?.files[0]);
      }
    }
    document.addEventListener("click", click, true);
    document.addEventListener("dragover", drop, true);
    document.addEventListener("drop", drop, true);
    return () => {
      document.removeEventListener("click", click, true);
      document.removeEventListener("dragover", drop, true);
      document.removeEventListener("drop", drop, true);
    };
  }, [editing, base, busy, session]);
  function duplicate() {
    if (!card) return;
    finish.current?.();
    const next = { ...draft.current },
      group = next[card.key],
      ids = group?.kind === "copies" ? [...group.ids] : [];
    const id = crypto.randomUUID(),
      source = card.scope.slice(card.scope.lastIndexOf("@") + 1);
    ids.splice(source === "original" ? 0 : ids.indexOf(source) + 1, 0, id);
    const prefix = card.key.slice(0, card.key.lastIndexOf("/") + 1),
      from = prefix + encodeURIComponent(card.scope) + "/",
      to =
        prefix +
        encodeURIComponent(
          card.scope.slice(0, card.scope.lastIndexOf("@") + 1) + id,
        ) +
        "/";
    for (const [key, value] of Object.entries(next))
      if (key.startsWith(from)) next[to + key.slice(from.length)] = value;
    next[card.key] = { kind: "copies", ids };
    update(next);
    setNotice("Card duplicated.");
  }
  async function publish() {
    finish.current?.();
    if (!base) return;
    setBusy(true);
    const current = draft.current;
    try {
      const { revision, warning } = await request(session, {
        action: "publish",
        revision: base.revision,
        fields: current,
      });
      setBase({ revision, fields: current });
      setNotice(warning || "Published.");
    } catch (e) {
      setNotice(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Content.Provider value={{ fields, editing: editing && !!base && !busy }}>
      {children}
      <aside className="msa-tools" aria-label="Page editor"
        onMouseDown={(event) => {
          // Keep the selection and toolbar stable until the button click runs.
          if (event.target instanceof Element && event.target.closest("button")) event.preventDefault();
        }}>
        <select
          aria-label="Go to page"
          value={pathname}
          disabled={busy}
          onChange={(e) => {
            finish.current?.();
            navigate(e.target.value);
          }}
        >
          {Object.entries({
            "/": "Home",
            "/about": "About",
            "/events": "Events",
            "/gallery": "Gallery",
            "/join": "Join",
            "/contact": "Contact",
            "/resources": "Resources",
            "/resources/new-to-pitt": "New to Pitt",
            "/resources/prayer": "Prayer",
            "/resources/prayer-locations": "Prayer locations",
            "/resources/prayer-times": "Prayer times",
            "/resources/chaplain": "Chaplain",
            "/resources/faq": "FAQ",
            "/board": "Board",
            ...(pathname.startsWith("/gallery/")
              ? { [pathname]: "Gallery album" }
              : {}),
          }).map(([url, title]) => (
            <option key={url} value={url}>
              {title}
            </option>
          ))}
        </select>
        <button
          disabled={!base || busy}
          onClick={() => {
            finish.current?.();
            setEditing(!editing);
          }}
        >
          {editing ? "Browse pages" : "Edit content"}
        </button>
        {active && (
          <>
            {[
              ["B", "bold", ""],
              ["I", "italic", ""],
              ["Small", "fontSize", "2"],
              ["Normal", "fontSize", "3"],
              ["Large", "fontSize", "5"],
            ].map(([label, cmd, arg]) => (
              <button
                key={label}
                aria-label={cmd === "fontSize" ? label + " text" : cmd}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => document.execCommand(cmd, false, arg)}
              >
                {label}
              </button>
            ))}
          </>
        )}
        {card && editing && (
          <button disabled={busy} onClick={duplicate}>
            Duplicate card
          </button>
        )}
        <button
          disabled={!base || busy || (!dirty && !active)}
          onClick={() => {
            finish.current?.();
            if (base) update(base.fields);
            setNotice("Draft discarded.");
          }}
        >
          Discard
        </button>
        <button
          className="msa-publish"
          disabled={!base || busy || (!dirty && !active)}
          onClick={publish}
        >
          {busy ? "Saving…" : "Publish"}
        </button>
        <button
          disabled={busy}
          onClick={() => {
            if (!dirty || confirm("Discard unpublished changes and sign out?"))
              void supabase.auth.signOut();
          }}
        >
          Sign out
        </button>
        <span role="status">
          {notice || (!base ? "Loading…" : dirty ? "Unpublished changes" : "")}
        </span>
        <input
          type="file"
          hidden
          ref={file}
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            void upload(imageKey.current, e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </aside>
    </Content.Provider>
  );
}
