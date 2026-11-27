import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { useLocation, useNavigate } from "react-router-dom";
import { GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { builtInPages, customPages, getVisualPage, visualKey, type VisualPage, type VisualBlock, type VisualSection, type Presentation } from "./visual-model";
import type { Field, Fields } from "./content";
import Collections, { NavigationPanel } from "./VisualCollections";
import MediaLibrary from "./MediaLibrary";

export type EditorPanel = "structure" | "pages" | "menus" | "collections" | "media";
type Picker = (apply: (url: string) => void) => void;
type Change = (key: string, value?: Field) => void;
type Item = { id: string; source?: string; label: string };

export function moveItem<T>(items: T[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || to >= items.length) return items;
  const next = [...items];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

export function OrderButtons({ index, total, name, move }: { index: number; total: number; name: string; move: (target: number) => void }) {
  return <span className="msa-order-buttons">
    <button type="button" aria-label={`Move ${name} earlier`} disabled={index === 0} onClick={() => move(index - 1)}><ChevronUp size={15}/></button>
    <button type="button" aria-label={`Move ${name} later`} disabled={index === total - 1} onClick={() => move(index + 1)}><ChevronDown size={15}/></button>
  </span>;
}

const blockTypes: Record<VisualBlock["type"], string> = {
  heading: "Heading", text: "Text section", image: "Photo", button: "Call to action",
  gallery: "Gallery", grid: "Card grid", announcement: "Announcement", faq: "FAQ",
};

export function DateControls({ starts, ends, change }: {
  starts?: string; ends?: string; change: (patch: {starts?: string; ends?: string}) => void;
}) {
  const local = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  const utc = (value: string) => value ? new Date(value).toISOString() : undefined;
  return <div className="msa-field-pair">
    <label>Publish at<input type="datetime-local" value={local(starts)} onChange={event => change({starts: utc(event.target.value)})}/></label>
    <label>Expire at<input type="datetime-local" value={local(ends)} onChange={event => change({ends: utc(event.target.value)})}/></label>
  </div>;
}

export function ImageControl({ title, value, change, pick }: {
  title: string; value?: string; change: (url?: string) => void; pick: Picker;
}) {
  return <div className="msa-image-control">
    {value && <img src={value + (value.startsWith("https://cdn.sanity.io/") ? "?w=144&auto=format" : "")} alt="" loading="lazy" width={72} height={52}/>}
    <button type="button" onClick={() => pick(change)}>{value ? "Replace " : "Choose "}{title}</button>
    {value && <button type="button" onClick={() => change()}>Clear</button>}
  </div>;
}

function PresentationControls({ value, change }: { value?: Presentation; change: (value: Presentation) => void }) {
  const controls: [keyof Presentation, string, string[]][] = [
    ["tone", "Background", ["default", "warm", "emerald", "navy"]],
    ["spacing", "Spacing", ["normal", "compact", "roomy"]],
    ["align", "Alignment", ["left", "center"]],
    ["size", "Heading size", ["normal", "large"]],
    ["columns", "Grid columns", ["three", "two", "one"]],
  ];
  return <details><summary>Appearance</summary><div className="msa-field-pair">
    {controls.map(([key, label, values]) => <label key={key}>{label}
      <select value={value?.[key] ?? ""} onChange={event => change({ ...value, [key]: event.target.value || undefined })}>
        <option value="">Inherit</option>{values.map(option => <option key={option}>{option}</option>)}
      </select>
    </label>)}
  </div></details>;
}

function BlockControls({ block, save, pick }: { block: VisualBlock; save: (value: VisualBlock) => void; pick: Picker }) {
  const apply = (patch: Partial<VisualBlock>) => save({ ...block, ...patch });
  return <>
    {["button","announcement"].includes(block.type) && <label>Destination<input type="text" value={block.url || ""} onChange={event => apply({url: event.target.value || undefined})}/></label>}
    {block.type === "image" && <ImageControl title="image" value={block.image} pick={pick} change={image => apply({image})}/>}
    {block.type === "announcement" && <DateControls starts={block.starts} ends={block.ends} change={apply}/>}
    {block.type === "gallery" && <div>
      {(block.images ?? []).map((photo, index, photos) => <div key={index} className="msa-panel-row">
        <ImageControl title="photo" value={photo.src} pick={pick} change={url => apply({images: url
          ? photos.map((item, i) => i === index ? {...item, src: url} : item) : photos.filter((_, i) => i !== index)})}/>
        <label>Caption<input value={photo.alt} onChange={event => apply({images: photos.map((item, i) => i === index ? {...item, alt: event.target.value} : item)})}/></label>
        <OrderButtons index={index} total={photos.length} name={`photo ${index + 1}`} move={to => apply({images: moveItem(photos, index, to)})}/>
      </div>)}
      <button type="button" disabled={(block.images?.length ?? 0) >= 24} onClick={() => pick(src => apply({images: [...(block.images ?? []), {src, alt: ""}]}))}>Add gallery photo</button>
    </div>}
    {block.type === "grid" && <div>
      {(block.cards ?? []).map((card, index, cards) => {
        const edit = (patch: Partial<typeof card>) => apply({cards: cards.map((item, i) => i === index ? {...item, ...patch} : item)});
        return <details key={card.id}>
          <summary>{card.title}</summary>
          <label>Card title<input value={card.title} onChange={event => edit({title: event.target.value})}/></label>
          <label>Card text<textarea value={card.body || ""} onChange={event => edit({body: event.target.value})}/></label>
          <label>Card destination<input value={card.url || ""} onChange={event => edit({url: event.target.value || undefined})}/></label>
          <ImageControl title="card image" value={card.image} pick={pick} change={image => edit({image})}/>
          <OrderButtons index={index} total={cards.length} name={card.title} move={to => apply({cards: moveItem(cards, index, to)})}/>
          <button type="button" onClick={() => apply({cards: [...cards, {...card, id: crypto.randomUUID()}]})}>Duplicate card</button>
          <button type="button" onClick={() => apply({cards: cards.filter(item => item.id !== card.id)})}>Remove card</button>
        </details>;
      })}
      <button type="button" disabled={(block.cards?.length ?? 0) >= 24} onClick={() => apply({cards: [...(block.cards ?? []), {id: crypto.randomUUID(), title: "New card", body: "Add card text."}]})}>Add card</button>
    </div>}
  </>;
}

export default function VisualPanels({ panel, close, fields, change, changeFields, session, selected, select }: {
  panel: EditorPanel; close: () => void; fields: Fields; change: Change; changeFields: (fn: (fields: Fields) => Fields) => void;
  session: Session; selected: string; select: (id: string) => void;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [definitions, setDefinitions] = useState<Item[]>([]);
  const [dragging, setDragging] = useState(-1);
  const [picker, setPicker] = useState<((url: string) => void)>();
  const [slugError, setSlugError] = useState("");
  const [addType, setAddType] = useState<VisualBlock["type"]>("text");
  const page = getVisualPage(fields, pathname) ?? {kind:"page", id:"built-in", title: builtInPages[pathname] ?? "Page", sections: [], blocks: []};
  const key = visualKey.page + (page.path ? page.id : pathname);
  const current = (fields[key]?.kind === "page" ? fields[key] : page) as VisualPage;
  const save = (patch: Partial<VisualPage>) => change(key, {...current, ...patch, kind: "page"});
  const pick: Picker = apply => setPicker(() => apply);

  useEffect(() => {
    const canvas = document.getElementById("main-content");
    if (!canvas) return;
    function update() {
      setDefinitions([...canvas.querySelectorAll<HTMLElement>("[data-visual-section]")].map(node => ({
        id: node.dataset.visualSection, label: node.dataset.visualLabel, source: node.dataset.visualSource,
      })));
    }
    update();
    const observer = new MutationObserver(update);
    observer.observe(canvas, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-visual-label", "data-visual-section"] });
    return () => observer.disconnect();
  }, [pathname, panel]);

  const rows: Item[] = definitions.length ? definitions : [
    ...current.sections.map(item => ({...item, label: item.id.replace(/-/g, " ")})),
    ...current.blocks.filter(block => !current.sections.some(row => row.id === block.id)).map(block => ({id: block.id, label: block.title})),
  ];
  const entries: VisualSection[] = rows.map(row => current.sections.find(value => value.id === row.id) ?? {id: row.id, ...(row.source ? {source: row.source} : {})});
  const activeIndex = rows.findIndex(row => row.id === selected);
  const active = entries[activeIndex];
  const block = current.blocks.find(value => value.id === selected);
  const patchBlock = (next: VisualBlock) => save({blocks: current.blocks.map(value => value.id === next.id ? next : value)});
  const updateSection = (patch: Partial<VisualSection>) => save({sections: entries.map(item => item.id === selected ? {...item, ...patch} : item)});
  const addPage = (duplicate: boolean) => {
    const id = crypto.randomUUID();
    const path = `/${duplicate ? current.path.slice(1) + "-copy" : "new-page"}-${id.slice(0, 6)}`;
    const next: VisualPage = duplicate ? {...current, id, path, title: current.title + " (copy)", visibility: "draft"}
      : {kind:"page", id, path, title:"New page", subtitle:"", template:"information", visibility:"draft", sections:[], blocks:[]};
    changeFields(fields => {
      const result: Fields = {...fields, [visualKey.page + id]: next};
      if (duplicate) for (const [field, value] of Object.entries(fields)) {
        if (field.startsWith(current.path + "/")) result[path + field.slice(current.path.length)] = value;
      }
      return result;
    });
    navigate(path);
  };

  return <aside className="msa-editor-panel msa-tools-surface" aria-label="Visual editor sidebar">
    <header><strong>{{structure:"Page structure", pages:"Pages", menus:"Navigation and footer", collections:"Collections", media:"Media library"}[panel]}</strong>
      <button type="button" onClick={close}>Close</button></header>
    {picker ? <><button type="button" onClick={() => setPicker(undefined)}>Back to settings</button>
      <MediaLibrary session={session} choose={url => { picker(url); setPicker(undefined); }}/></> : <>
      {panel === "structure" && <>
        <ol className="msa-structure-list">{rows.map((row, index) => <li key={row.id} data-selected={selected === row.id}
          onDragOver={event => { if (dragging >= 0) event.preventDefault(); }}
          onDrop={event => { if (dragging < 0) return; event.preventDefault(); save({sections: moveItem(entries, dragging, index)}); setDragging(-1); }}>
          <span className="msa-drag-handle" draggable title={`Drag ${row.label}`} onDragStart={event => {
            event.dataTransfer.setData("text/plain", row.id);
            event.dataTransfer.effectAllowed = "move";
            setDragging(index);
          }} onDragEnd={() => setDragging(-1)}><GripVertical size={16}/></span>
          <button type="button" onClick={() => {
            select(row.id);
            const element = [...document.querySelectorAll<HTMLElement>("[data-visual-section]")].find(node => node.dataset.visualSection === row.id);
            (element?.firstElementChild ?? element)?.scrollIntoView({block:"center", behavior:"instant"});
          }}>{row.label}{entries[index]?.hidden ? " · Hidden" : ""}</button>
          <OrderButtons name={row.label} index={index} total={rows.length} move={to => save({sections: moveItem(entries, index, to)})}/>
        </li>)}</ol>
        {active && <div className="msa-panel-divider">
          <strong>{rows[activeIndex].label}</strong>
          <div className="msa-panel-actions">
            <button type="button" onClick={() => updateSection({hidden: !active.hidden})}>{active.hidden ? "Show section" : "Hide section"}</button>
            <button type="button" onClick={() => {
              const id = crypto.randomUUID();
              const extra = { ...active, id, ...(block ? {} : {source: active.source ?? active.id}) };
              const next = [...entries]; next.splice(activeIndex + 1, 0, extra);
              changeFields(fields => {
                const result: Fields = {...fields, [key]: {...current, sections: next, blocks: block ? [...current.blocks, {...block, id}] : current.blocks}};
                if (block) {
                  const from = (pathname === "/" ? "/" : pathname) + "/visual-" + block.id + "/";
                  const to = from.replace(block.id, id);
                  for (const [key, value] of Object.entries(fields)) if (key.startsWith(from)) result[to + key.slice(from.length)] = value;
                }
                return result;
              });
              select(id);
            }}>Duplicate section</button>
            {(active.source || block) && <button type="button" onClick={() => {
              save({sections:entries.filter(item => item.id !== selected), blocks:current.blocks.filter(item => item.id !== selected)});
              select("");
            }}>Remove section</button>}
          </div>
          <PresentationControls value={active.presentation} change={presentation => updateSection({presentation})}/>
          {block && <BlockControls block={block} save={patchBlock} pick={pick}/>}
        </div>}
        <label>Add a section<select value={addType} onChange={event => setAddType(event.target.value as VisualBlock["type"])}>
          {Object.entries(blockTypes).map(([key,label]) => <option key={key} value={key}>{label}</option>)}
        </select></label>
        <button type="button" disabled={current.blocks.length >= 50 || rows.length >= 60} onClick={() => {
          const id = crypto.randomUUID();
          save({ sections: [...entries,{id}], blocks: [...current.blocks,{
            id, type:addType, title:blockTypes[addType],
            body: ["text","faq","announcement"].includes(addType) ? "Add your content here." : undefined,
            url: addType === "button" ? "/events" : undefined,
            cards: addType === "grid" ? [{id:crypto.randomUUID(),title:"New card", body:"Add card text."}] : undefined,
          }]});
          select(id);
        }}>Add section</button>
      </>}
      {panel === "pages" && <>
        <button type="button" onClick={() => addPage(false)}>Create page</button>
        <label>Current page<select value={pathname} onChange={event => navigate(event.target.value)}>
          {Object.entries(builtInPages).map(([url, title]) => <option key={url} value={url}>{title}</option>)}
          {customPages(fields).map(page => <option key={page.id} value={page.path}>{page.title}{page.visibility !== "published" ? " (draft)" : ""}</option>)}
        </select></label>
        {current.path && <>
          <label>Page name<input maxLength={160} value={current.title} onChange={event => save({title: event.target.value})}/></label>
          <label>Subtitle<input value={current.subtitle ?? ""} onChange={event => save({subtitle:event.target.value})}/></label>
          <label>URL<input key={current.path} defaultValue={current.path} onBlur={event => {
            const path = "/" + event.target.value.trim().replace(/^\/+/, "").toLowerCase();
            if (path === pathname) return;
            if (!/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path) || path.length > 97 || /^(?:\/admin|\/owner|\/auth|\/api|\/assets|\/photos|\/prayer-times)$/.test(path) ||
              builtInPages[path] || customPages(fields).some(page => page.path === path)) {
              setSlugError("Choose an unused URL with letters, numbers, and hyphens."); return;
            }
            setSlugError("");
            changeFields(fields => {
              const next = {...fields, [key]: {...current, path}};
              for (const original of Object.keys(fields)) if (original.startsWith(pathname + "/")) {
                next[path + original.slice(pathname.length)] = fields[original];
                delete next[original];
              }
              return next;
            });
            navigate(path, {replace:true});
          }}/></label>
          {slugError && <p role="status">{slugError}</p>}
          <label>Template<select value={current.template} onChange={event => save({template:event.target.value as VisualPage["template"]})}>
            <option value="information">Information</option><option value="campaign">Campaign</option><option value="landing">Landing page</option>
          </select></label>
          <label>Visibility<select value={current.visibility} onChange={event => save({visibility:event.target.value as VisualPage["visibility"]})}>
            <option value="draft">Unpublished</option><option value="published">Published after saving</option>
          </select></label>
          <DateControls starts={current.starts} ends={current.ends} change={save}/>
          <div className="msa-panel-actions"><button type="button" onClick={() => addPage(true)}>Duplicate page</button>
            <button type="button" onClick={() => {
              if (!confirm(`Remove “${current.title}” from the draft?`)) return;
              changeFields(fields => Object.fromEntries(Object.entries(fields).filter(([id]) => id !== key && !id.startsWith(pathname + "/"))));
              navigate("/");
            }}>Delete page</button>
          </div>
        </>}
        <label>Search and social title<input maxLength={160} value={current.seoTitle ?? ""} onChange={event => save({seoTitle:event.target.value || undefined})}/></label>
        <label>Description<textarea maxLength={6000} value={current.description ?? ""} onChange={event => save({description:event.target.value || undefined})}/></label>
        <ImageControl title="social image" value={current.share} change={share => save({share})} pick={pick}/>
        {(current.seoTitle || current.description || current.share) && <div className="msa-social-preview">
          {current.share && <img src={current.share} alt="" width={300} height={156}/>}
          <strong>{current.seoTitle || current.title}</strong><p>{current.description}</p>
        </div>}
      </>}
      {panel === "menus" && <NavigationPanel fields={fields} change={change}/>}
      {panel === "collections" && <Collections fields={fields} change={change} pick={pick}/>}
      {panel === "media" && <MediaLibrary session={session}/>}
    </>}
  </aside>;
}
