import History from "./History";
import {
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Content, type Fields, type Field } from "./content";
import { type Snapshot } from "./SiteContent";
import VisualPanels, { moveItem, OrderButtons, type EditorPanel } from "./VisualPanels";
import VisualPreview, { type Device } from "./VisualPreview";
import MediaLibrary, { uploadMedia } from "./MediaLibrary";
import { builtInPages, customPages } from "./visual-model";
import { editText } from "./inlineText";
import "./admin.css";
import { validEditorLink } from "../../shared/editor-links.js";

import ManagementLogin, { request, messageOf } from "./ManagementLogin";
export default function Admin({ children }: { children: ReactNode }) {
  return (
    <ManagementLogin>
      {(session) => <Editor session={session}>{children}</Editor>}
    </ManagementLogin>
  );
}

type Delta = Record<string, Field | null>;

function applyDelta(base: Fields, delta: Delta) {
  const next = {...base};
  for (const [key,value] of Object.entries(delta)) {
    if (value === null) delete next[key];
    else next[key] = value;
  }
  return next;
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
  const [orderGroup, setOrderGroup] = useState<string>();
  const [showCardOrder,setShowCardOrder] = useState(false);
  const [draggedCard,setDraggedCard] = useState(-1);
  const [link, setLink] = useState<{ key: string; url: string } | null>(null);
  const [preview, setPreview] = useState<Fields | null>(null);
  const [picture, setPicture] = useState<{ key: string; alt: string; position?: string; cover?: {key:string; index:number; current:number} } | null>(null);
  const [panel, setPanel] = useState<EditorPanel>();
  const [selected, selectSection] = useState("");
  const [device, setDevice] = useState<Device>();
  const [picking, setPicking] = useState<string>();
  const [stale, setStale] = useState<Delta>();
  const draftVersion = useRef<string | null>(null);
  const saving = useRef<Promise<void>>(Promise.resolve());
  const autosaveTimer = useRef<number>();
  const [persisted, setPersisted] = useState<Fields>();
  const [history, setHistory] = useState(false);
  const finish = useRef<() => void>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const undo = useRef<Fields[]>([]),
    redo = useRef<Fields[]>([]);
  function update(next: Fields, record = true) {
    if (record) {
      undo.current = [...undo.current.slice(-29), draft.current];
      redo.current = [];
    }
    draft.current = next;
    setFields(next);
  }
  function field(key: string, value: Field) {
    update({ ...draft.current, [key]: value });
  }
  useEffect(() => {
    let live = true;
    request(session, { action: "draft_load" })
      .then((s: Snapshot & {saved?: Delta; stale?: Delta; draftVersion?: string}) => {
        if (live) {
          setBase(s);
          draftVersion.current = s.draftVersion ?? null;
          const restored = s.saved ? applyDelta(s.fields, s.saved) : s.fields;
          update(restored, false);
          setPersisted(restored);
          if (s.stale) setStale(s.stale);
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
    setLink(null);
    setPicture(null);
    setPicking(undefined);
    setOrderGroup(undefined);
    setShowCardOrder(false);
    selectSection("");
  }, [pathname, editing]);
  const dirty = base && fields !== base.fields;
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if ((dirty && persisted !== fields) || active) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, fields, persisted, active]);
  useEffect(() => {
    if (!base || busy || stale || persisted === fields) return;
    autosaveTimer.current = window.setTimeout(() => {
      saving.current = saving.current.then(async () => {
        try {
          const saved = await request(session, {
            action: "draft_save", fields, revision: base.revision, draftVersion: draftVersion.current,
          });
          draftVersion.current = saved.draftVersion ?? null;
          setPersisted(fields);
        } catch (error) {
          setNotice(messageOf(error));
        }
      });
    }, 700);
    return () => clearTimeout(autosaveTimer.current);
  }, [fields, base, busy, persisted, stale, session]);

  async function upload(key: string, image: File | undefined) {
    if (!image || !key || busy) return;
    setBusy(true);
    try {
      field(key, {kind:"image", url:await uploadMedia(session, image)});
      setNotice("Image ready to publish.");
    } catch (e) { setNotice(messageOf(e)); }
    finally { setBusy(false); }
  }
  useLayoutEffect(() => {
    if (!editing || !base || busy || history || preview) return;
    function click(e: MouseEvent) {
      const el = e.target instanceof Element ? e.target : null;
      if (!el || el.closest(".msa-tools, .msa-tools-surface, .msa-device-preview")) return;
      if (el.closest("[contenteditable=true]")) {
        if (el.closest("a")) e.preventDefault();
        e.stopPropagation();
        return;
      }
      const section = el.closest<HTMLElement>("[data-visual-section]");
      if (section) selectSection(section.dataset.visualSection!);
      const parent = el.closest<HTMLElement>("[data-edit-card]");
      if (parent?.dataset.cardOrderKey !== orderGroup) setShowCardOrder(false);
      setOrderGroup(parent?.dataset.cardOrderKey);
      setCard(
        parent
          ? { key: parent.dataset.editCard!, scope: parent.dataset.copyScope! }
          : null,
      );
      const anchor = el.closest<HTMLAnchorElement>("[data-edit-link]");
      setLink(
        anchor
          ? {
              key: anchor.dataset.editLink!,
              url: anchor.getAttribute("href") ?? "",
            }
          : null,
      );
      const text = el.closest<HTMLElement>("[data-edit-text]"),
        image = el.closest<HTMLElement>("[data-edit-image]");
      if (!text && !image && !anchor) {
        setPicture(null);
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      finish.current?.();
      const venue = image?.closest<HTMLElement>("[data-cover-key]");
      setPicture(
        image
          ? {
              key: image.dataset.editImage!,
              alt: image.getAttribute("alt") || "",
              position: image.dataset.editPosition,
              cover: venue ? {key:venue.dataset.coverKey, index:Number(venue.dataset.coverIndex), current:Number(venue.dataset.coverCurrent)} : undefined,
            }
          : null,
      );
      if (image) return;
      if (!text) return;
      const key = text.dataset.editText!,
        prev = draft.current[key],
        original = text.textContent ?? "";
      const oldRuns = prev?.kind === "text" ? prev.runs : undefined;
      setActive(true);
      finish.current = editText(text, oldRuns, (runs) => {
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
  }, [editing, base, busy, session, history, preview, orderGroup]);
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
  function editLink() {
    if (!link) return;
    finish.current?.();
    const response = window.prompt(
      "Link destination. Leave blank to restore the default.",
      link.url,
    );
    if (response === null) return;
    const url = response.trim();
    if (url && !validEditorLink(url)) {
      setNotice("Enter a site path, website URL, or mailto: email link.");
      return;
    }
    const next = { ...draft.current };
    if (url) next[link.key] = { kind: "link", url };
    else delete next[link.key];
    update(next);
    setLink(null);
    setNotice(
      url ? "Link ready to publish." : "Default link restored in the draft.",
    );
  }
  function removeCopy() {
    if (!card || card.scope.endsWith("@original")) return;
    if (!window.confirm("Remove this duplicate card from the draft?")) return;
    finish.current?.();
    const next = { ...draft.current };
    const group = next[card.key];
    if (group?.kind !== "copies") return;
    const copy = card.scope.slice(card.scope.lastIndexOf("@") + 1);
    const scopePrefix =
      card.key.slice(0, card.key.lastIndexOf("/") + 1) +
      encodeURIComponent(card.scope) +
      "/";
    for (const key of Object.keys(next)) {
      if (key.startsWith(scopePrefix)) delete next[key];
    }
    delete next[card.key + "/visibility/" + copy];
    const ids = group.ids.filter((id) => id !== copy);
    if (ids.length) next[card.key] = { kind: "copies", ids };
    else delete next[card.key];
    update(next);
    setCard(null);
    setLink(null);
    setNotice("Duplicate removed from the draft.");
  }
  const instance = card?.scope.slice(card.scope.lastIndexOf("@") + 1);
  const group = card ? fields[card.key] : null;
  const copyIds = group?.kind === "copies" ? group.ids : [];
  const position = instance ? copyIds.indexOf(instance) : -1;
  function moveCopy(delta: number) {
    if (
      !card ||
      position < 0 ||
      position + delta < 0 ||
      position + delta >= copyIds.length
    )
      return;
    finish.current?.();
    const ids = [...copyIds];
    [ids[position], ids[position + delta]] = [
      ids[position + delta],
      ids[position],
    ];
    field(card.key, { kind: "copies", ids });
  }
  const visibilityKey = card ? card.key + "/visibility/" + instance : "";
  const visibility = fields[visibilityKey];
  const hidden = visibility?.kind === "visibility" && visibility.hidden;
  function rewind(forward: boolean) {
    finish.current?.();
    const source = forward ? redo : undo,
      destination = forward ? undo : redo;
    const previous = source.current.pop();
    if (previous) {
      destination.current.push(draft.current);
      update(previous, false);
    }
    setCard(null);
    setLink(null);
  }
  async function publish() {
    finish.current?.();
    if (!base) return;
    setBusy(true);
    const current = draft.current;
    clearTimeout(autosaveTimer.current);
    try {
      await saving.current;
      const { revision, warning } = await request(session, {
        action: "publish",
        revision: base.revision,
        fields: current,
      });
      undo.current = [];
      redo.current = [];
      setBase({ revision, fields: current });
      setPersisted(current);
      try {
        if (draftVersion.current) {
          const cleared = await request(session, {action:"draft_clear", draftVersion:draftVersion.current});
          draftVersion.current = cleared.draftVersion ?? null;
        }
        setNotice(warning || "Published.");
      } catch {
        setNotice("Published. The saved draft could not be cleared.");
      }
    } catch (e) {
      setNotice(messageOf(e));
    } finally {
      setBusy(false);
    }
  }
  const cardNodes = showCardOrder && orderGroup
    ? [...document.querySelectorAll<HTMLElement>("[data-card-order-key]")].filter(node => node.dataset.cardOrderKey === orderGroup)
    : [];
  const ordered = fields[orderGroup];
  if (ordered?.kind === "order") cardNodes.sort((a,b) => {
    const at = (el: HTMLElement) => {
      const index = ordered.ids.indexOf(el.dataset.cardOrderId);
      return index === -1 ? Number.MAX_SAFE_INTEGER : index;
    };
    return at(a) - at(b);
  });
  const moveCard = (from:number,to:number) => {
    finish.current?.();
    field(orderGroup,{kind:"order",ids:moveItem(cardNodes.map(el=>el.dataset.cardOrderId),from,to)});
  };
  return (
    <Content.Provider
      value={{
        fields: preview ?? fields,
        editing: !preview && editing && !!base && !busy && !history,
      }}
    >
      {children}
      {history && (
        <History
          session={session}
          onClose={() => setHistory(false)}
          onPreview={(value) => {
            setPreview(value);
            setHistory(false);
          }}
          onRestore={() => location.reload()}
        />
      )}
      {preview && (
        <div className="msa-tools">
          <button
            onClick={() => {
              setPreview(null);
              setHistory(true);
            }}
          >
            Exit version preview
          </button>
        </div>
      )}
      {device && <VisualPreview fields={fields} path={pathname} device={device} onClose={() => setDevice(undefined)} />}
      {!preview && editing && showCardOrder && <aside className="msa-editor-panel msa-tools-surface" aria-label="Card order">
        <header><strong>Card order</strong><button onClick={()=>setShowCardOrder(false)}>Close</button></header>
        <ol className="msa-structure-list">{cardNodes.map((node,index)=><li key={node.dataset.cardOrderId}
          onDragOver={event=>{if(draggedCard >= 0) event.preventDefault();}}
          onDrop={event=>{if(draggedCard<0)return;event.preventDefault();moveCard(draggedCard,index);setDraggedCard(-1);}}>
          <span className="msa-drag-handle" draggable title="Drag card" onDragStart={event=>{
            event.dataTransfer.setData("text/plain",node.dataset.cardOrderId);setDraggedCard(index);
          }} onDragEnd={()=>setDraggedCard(-1)}>⠿</span>
          <span>{node.dataset.cardOrderLabel}</span>
          <OrderButtons name={node.dataset.cardOrderLabel} index={index} total={cardNodes.length} move={to=>moveCard(index,to)}/>
        </li>)}</ol>
      </aside>}
      {!preview && panel && !picking && !showCardOrder && <VisualPanels panel={panel} close={() => setPanel(undefined)} fields={fields}
        change={(key,value) => {
          finish.current?.();
          const next = {...draft.current};
          if (value) next[key] = value;
          else delete next[key];
          update(next);
        }}
        changeFields={next => { finish.current?.(); update(next(draft.current)); }}
        selected={selected} select={selectSection} session={session}/>}
      {picking && <aside className="msa-editor-panel msa-tools-surface" aria-label="Choose a replacement image">
        <header><strong>Choose an image</strong><button onClick={() => setPicking(undefined)}>Close</button></header>
        <MediaLibrary session={session} choose={url => { field(picking,{kind:"image",url}); setPicking(undefined); }}/>
      </aside>}
      {!preview && (
        <aside
          className="msa-tools"
          aria-label="Page editor"
          onMouseDown={(event) => {
            // Keep the selection and toolbar stable until the button click runs.
            if (
              event.target instanceof Element &&
              event.target.closest("button")
            )
              event.preventDefault();
          }}
        >
          {stale && <div className="msa-draft-recovery"><span>A newer version was published after your last draft.</span>
            <button disabled={busy} onClick={() => { update(applyDelta(draft.current,stale)); setStale(undefined); }}>Recover my changes</button>
            <button disabled={busy} onClick={() => { update({...draft.current},false); setStale(undefined); }}>Clear saved draft</button>
          </div>}
          <button
            disabled={busy || !!dirty || active}
            title="Publish or discard current edits before opening history"
            onClick={() => setHistory(true)}
          >
            History
          </button>
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
              ...builtInPages,
              ...Object.fromEntries(customPages(fields).map(page => [page.path, page.title])),
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
          <button type="button" disabled={busy} onClick={async () => {
            finish.current?.();
            setBusy(true);
            try {
              const result = await request(session, {}, "/api/calendar");
              if (result.synced) {
                localStorage.removeItem("msa-calendar-events-v1");
                window.dispatchEvent(new Event("msa-calendar-refreshed"));
                setNotice(`Calendar refreshed · ${result.count} events.`);
              } else setNotice(result.message || "The last saved calendar is available.");
            } catch(error) {setNotice(messageOf(error));}
            finally {setBusy(false);}
          }}>Refresh events now</button>
          <details className="msa-editor-menu"><summary>Edit site</summary><div>
            {([["structure","Structure"],["pages","Pages"],["menus","Navigation"],["collections","Collections"],["media","Media"]] as const).map(([id,label]) => (
              <button key={id} disabled={!base || busy || !editing} type="button"
                onClick={event => { finish.current?.(); setPanel(panel === id ? undefined : id); event.currentTarget.closest("details").open = false; }}>{label}</button>
            ))}
          </div></details>
          <details className="msa-editor-menu"><summary>Preview</summary><div>
            {(["desktop","tablet","phone"] as const).map(mode => <button key={mode} disabled={!base || busy}
              onClick={event => { finish.current?.(); setDevice(mode); event.currentTarget.closest("details").open = false; }}>{mode}</button>)}
          </div></details>
          {active && (
            <>
              {[
                ["B", "bold", ""],
                ["I", "italic", ""],
                ["U", "underline", ""],
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
          {editing && (
            <>
              <button
                disabled={busy || !undo.current.length}
                onClick={() => rewind(false)}
              >
                Undo
              </button>
              <button
                disabled={busy || !redo.current.length}
                onClick={() => rewind(true)}
              >
                Redo
              </button>
            </>
          )}
          {card && editing && (
            <button
              disabled={busy}
              onClick={() => {
                finish.current?.();
                field(visibilityKey, { kind: "visibility", hidden: !hidden });
              }}
            >
              {hidden ? "Show card" : "Hide card"}
            </button>
          )}
          {picture && editing && <details className="msa-editor-menu" open>
            <summary>Image settings</summary>
            <div className="msa-image-toolbar">
              <button disabled={busy} onClick={() => setPicking(picture.key)}>Replace image</button>
              {picture.cover && <button disabled={fields[picture.cover.key]?.kind === "selection"
                ? (fields[picture.cover.key] as {index: number}).index === picture.cover.index
                : picture.cover.current === picture.cover.index}
                onClick={() => field(picture.cover.key,{kind:"selection",index:picture.cover.index})}>Use as preview photo</button>}
              <label>Description<input value={picture.alt} maxLength={1000} onChange={event => {
                const alt = event.target.value;
                field(picture.key + "/alt", {kind:"alt",text:alt});
                setPicture({...picture,alt});
              }}/></label>
              {(() => {
                const saved = fields[picture.key + "/focal"];
                const [defaultX, defaultY] = picture.position?.match(/[\d.]+(?=%)/g)?.map(Number) ?? [50,50];
                const crop = saved?.kind === "focal" ? saved : {kind:"focal" as const,x:defaultX,y:defaultY};
                return <>
                  <label>Crop across<input type="range" min={0} max={100} value={crop.x} onChange={event => field(picture.key + "/focal",{...crop,x:Number(event.target.value)})}/></label>
                  <label>Crop down<input type="range" min={0} max={100} value={crop.y} onChange={event => field(picture.key + "/focal",{...crop,y:Number(event.target.value)})}/></label>
                  {saved && <button onClick={() => { const next = {...draft.current}; delete next[picture.key + "/focal"]; update(next); }}>Reset crop</button>}
                </>;
              })()}
            </div>
          </details>}
          {editing && position >= 0 && copyIds.length > 1 && (
            <>
              <button
                disabled={busy || position === 0}
                onClick={() => moveCopy(-1)}
              >
                Move copy earlier
              </button>
              <button
                disabled={busy || position === copyIds.length - 1}
                onClick={() => moveCopy(1)}
              >
                Move copy later
              </button>
            </>
          )}
          {card && editing && orderGroup && <button type="button" onClick={() => {
            finish.current?.(); setPanel(undefined);setShowCardOrder(value=>!value);
          }}>Reorder cards</button>}
          {link && editing && (
            <button disabled={busy} onClick={editLink}>
              Edit link destination
            </button>
          )}
          {card && editing && (
            <>
              <button disabled={busy} onClick={duplicate}>
                Duplicate card
              </button>
              {!card.scope.endsWith("@original") && (
                <button disabled={busy} onClick={removeCopy}>
                  Remove duplicate
                </button>
              )}
            </>
          )}
          <button
            disabled={!base || busy || (!dirty && !active)}
            onClick={() => {
              finish.current?.();
              if (base) update(base.fields);
              setCard(null);
              setLink(null);
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
              if (
                !dirty || persisted === fields ||
                confirm("Sign out before your current edits have been saved?")
              )
                void supabase.auth.signOut();
            }}
          >
            Sign out
          </button>
          <span role="status">
            {notice ||
              (!base ? "Loading…" : dirty ? (persisted === fields ? "Draft saved" : "Saving draft…") : "")}
          </span>
        </aside>
      )}
    </Content.Provider>
  );
}
