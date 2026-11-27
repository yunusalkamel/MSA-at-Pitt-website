import { useState } from "react";
import { recaps } from "@/data/recaps";
import { communityAlbums, daylightWall, eveningWall, communityPhoto } from "@/data/communityPhotos";
import { fall26Albums } from "@/data/fall26Albums";
import { defaultMenus } from "@/data/siteMenus";
import { PARTNERS } from "@/components/PartnerLogos";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES } from "@/lib/sanity";
import type { Field, Fields } from "./content";
import { getCollection, visualKey, type NavItem, type SiteMenus, type CollectionItem, type CollectionType } from "./visual-model";
import { DateControls, ImageControl, OrderButtons, moveItem } from "./VisualPanels";

type Change = (key: string, value: Field) => void;
type Picker = (apply: (src: string) => void) => void;
const labels: Record<CollectionType,string> = {
  stories:"Stories", albums:"Photo albums", board:"Board members", partners:"Community partners",
  announcements:"Scheduled announcements", hero:"Home collage photos",
};
const roles = [
  ["president","President","presidentName"],["secretary","Secretary","secretaryName"],
  ["ext-vp","External VP","externalVPName"],["int-vp","Internal VP","internalVPName"],["biz-mgr","Business Manager","businessManagerName"],
  ["cec","Community Engagement Council","cecChairName"],["advocacy","Advocacy","advocacyChairName"],
  ["bros-dawah","Brothers Da’wah","brothersDawahChairName"],["sis-dawah","Sisters Da’wah","sistersDawahChairName"],
  ["bros-social","Brothers Social","brothersSocialChairName"],["sis-social","Sisters Social","sistersSocialChairName"],["marketing","Marketing","marketingChairName"],
] as const;

export function NavigationPanel({ fields, change }: { fields: Fields; change: Change }) {
  const field = fields[visualKey.menus];
  const menus = field?.kind === "menus" ? field : {kind: "menus" as const};
  const [zone, setZone] = useState<"main" | "resources" | "footer">("main");
  const links = menus[zone] ?? defaultMenus[zone];
  const save = (next: (NavItem & {group?: string})[]) => change(visualKey.menus, {...menus, [zone]: next});
  return <>
    <label>Link group<select value={zone} onChange={event => setZone(event.target.value as typeof zone)}>
      <option value="main">Main menu</option><option value="resources">Resources submenu</option><option value="footer">Footer</option>
    </select></label>
    {links.map((link, index) => {
      const update = (patch: Partial<NavItem> & { group?: string }) => save(links.map(item => item.id === link.id ? {...item,...patch} : item));
      return <details key={link.id}>
        <summary>{link.title}</summary>
        <label>Label<input maxLength={160} value={link.title} onChange={event => update({title:event.target.value})}/></label>
        <label>Destination<input value={link.url} onChange={event => update({url:event.target.value})}/></label>
        {zone === "footer" && <label>Column<select value={(link as NonNullable<SiteMenus["footer"]>[number]).group ?? "involved"} onChange={event => update({group:event.target.value})}>
          <option value="involved">Get involved</option><option value="campus">Campus life</option><option value="connect">Connect</option>
        </select></label>}
        <OrderButtons index={index} total={links.length} name={link.title} move={to => save(moveItem(links, index, to))}/>
        <button type="button" onClick={() => save(links.filter(item => item.id !== link.id))}>Remove link</button>
      </details>;
    })}
    <button type="button" disabled={links.length >= (zone === "main" ? 10 : zone === "footer" ? 18 : 14)}
      onClick={() => save([...links, ...[zone === "footer"
        ? {id:crypto.randomUUID(), title:"New link", url:"/events", group:"involved"}
        : {id:crypto.randomUUID(), title:"New link", url:"/events"}]])}>Add link</button>
    {menus[zone] && <button type="button" onClick={() => change(visualKey.menus,{...menus,[zone]:undefined})}>Restore default links</button>}
  </>;
}

function Records({ type, items, selected, setSelected, save, pick }: {
  type: CollectionType; items: CollectionItem[]; selected: string; setSelected: (id:string)=>void;
  save: (items: CollectionItem[])=>void; pick: Picker;
}) {
  const current = items.find(item => item.id === selected);
  const index = items.indexOf(current);
  const patch = (value: Partial<CollectionItem>) => save(items.map(item => item.id === selected ? {...item,...value} : item));
  const withPhotos = type === "stories" || type === "albums";
  const photos = current?.photos ?? [];
  return <>
    <label>Choose entry<select value={selected} onChange={event => setSelected(event.target.value)}>
      <option value="">Select an entry</option>{items.map(item => <option key={item.id} value={item.id}>{item.title}{item.hidden ? " (hidden)" : ""}</option>)}
    </select></label>
    <button type="button" disabled={items.length >= 125} onClick={() => {
      const id = crypto.randomUUID();
      const add: CollectionItem = {id, title:type === "hero" ? "New photo" : "New entry", hidden:true};
      if (withPhotos) { add.slug = "new-" + id.slice(0, 8); add.audience = "everyone"; }
      save([...items, add]); setSelected(id);
    }}>Add entry</button>
    {current && <>
      <label>{type === "announcements" ? "Announcement text" : "Name or title"}<input maxLength={160} value={current.title} onChange={event => patch({title:event.target.value})}/></label>
      {withPhotos && <>
        <label>URL slug<input value={current.slug ?? ""} onChange={event => patch({slug:event.target.value || undefined})}/></label>
        <label>Event date<input type="text" placeholder="YYYY-MM-DD" value={current.date ?? ""} onChange={event => patch({date:event.target.value || undefined})}/></label>
        <label>Audience<select value={current.audience ?? "everyone"} onChange={event => patch({audience:event.target.value as CollectionItem["audience"]})}>
          <option value="everyone">Everyone</option><option value="brothers">Brothers</option><option value="sisters">Sisters</option>
        </select></label>
        {type === "albums" && <label>Categories<input defaultValue={current.category?.join(", ")} key={current.id} onBlur={event => patch({category:event.target.value.split(",").map(value => value.trim()).filter(Boolean)})}/></label>}
        {type === "stories" && <><label>Highlight or stat<input value={current.body ?? ""} onChange={event => patch({body:event.target.value || undefined})}/></label>
          <label className="msa-check"><input type="checkbox" checked={current.home === true} onChange={event => patch({home:event.target.checked})}/> Feature on Home</label></>}
      </>}
      {(type === "board" || type === "partners") && <>
        <label>{type === "board" ? "Board position" : "Partner category"}<input value={current.role ?? ""} onChange={event => patch({role:event.target.value || undefined})}/></label>
        <label>Biography or description<textarea value={current.body ?? ""} onChange={event => patch({body:event.target.value || undefined})}/></label>
      </>}
      {["partners","announcements"].includes(type) && <label>Link destination<input value={current.url ?? ""} onChange={event => patch({url:event.target.value || undefined})}/></label>}
      {type === "announcements" ? <>
        <label>Link label<input value={current.linkLabel ?? ""} onChange={event => patch({linkLabel:event.target.value || undefined})}/></label>
        <label>Style<select value={current.tone ?? "info"} onChange={event => patch({tone:event.target.value as CollectionItem["tone"]})}>
          <option value="info">Information</option><option value="urgent">Urgent</option><option value="celebration">Celebration</option></select></label>
        <DateControls starts={current.starts} ends={current.ends} change={patch}/>
      </> : <ImageControl title={withPhotos ? "cover image" : "image"} value={current.image} change={image => patch({image})} pick={pick}/>}
      {type === "hero" && <label>Theme<select value={current.role || "day"} onChange={event => patch({role:event.target.value})}>
        <option value="day">Light</option><option value="night">Dark</option><option value="both">Both</option>
      </select></label>}
      {withPhotos && <details><summary>{photos.length} {type === "stories" ? "slides" : "photos"}</summary>
        {photos.map((photo,i) => <div className="msa-panel-row" key={i}>
          <ImageControl title="photo" value={photo.src} pick={pick} change={src => patch({photos:src
            ? photos.map((p,n) => i === n ? {...p,src} : p) : photos.filter((_,n) => i !== n)})}/>
          <label>Caption or description<textarea value={photo.alt} onChange={event => patch({photos:photos.map((p,n) => i === n ? {...p,alt:event.target.value} : p)})}/></label>
          {type === "stories" && <label>Slide format<select value={photo.aspect ?? .8} onChange={event => patch({photos:photos.map((p,n) => i === n ? {...p,aspect:Number(event.target.value)} : p)})}>
            <option value={.8}>Portrait (4:5)</option><option value={1}>Square</option><option value={1.5}>Landscape</option></select></label>}
          <OrderButtons index={i} total={photos.length} name={`image ${i + 1}`} move={to => patch({photos:moveItem(photos,i,to)})}/>
        </div>)}
        <button type="button" disabled={photos.length >= 32} onClick={() => pick(src => patch({photos:[...photos,{src,alt:"",...(type === "stories" ? {aspect:.8} : {})}]}))}>Add photo</button>
      </details>}
      <label className="msa-check"><input type="checkbox" checked={!current.hidden} onChange={event => patch({hidden:!event.target.checked})}/> Visible on the site</label>
      <div className="msa-panel-actions">
        <OrderButtons index={index} total={items.length} name={current.title} move={to => save(moveItem(items,index,to))}/>
        <button type="button" onClick={() => {
          const id = crypto.randomUUID();
          save([...items,{...current,id, title:(current.title + " (copy)").slice(0,160),slug:withPhotos ? "copy-"+id.slice(0, 8) : undefined,hidden:true}]); setSelected(id);
        }}>Duplicate entry</button>
        <button type="button" onClick={() => {
          if (!confirm(`Remove “${current.title}” from the draft?`)) return;
          save(items.filter(item => item.id !== current.id)); setSelected("");
        }}>Remove entry</button>
      </div>
    </>}
  </>;
}

function SeededRecords({ type, fields, change, pick }: { type:CollectionType; fields:Fields; change:Change; pick:Picker }) {
  const { data: leadership } = useSanityData<Record<string,string>>(type === "board" ? QUERIES.leadership : null);
  const { data: albums } = useSanityData<{slug:string;title:string;eventDate?:string;category?:string[];cover?:string;photos?:{src:string;alt:string}[]}[]>(type === "albums" ? QUERIES.editorGalleryAlbums : null);
  const [selected, setSelected] = useState("");
  let defaults: CollectionItem[] = [];
  switch (type) {
    case "stories": defaults = recaps.map((item,index) => ({id:item.slug,slug:item.slug,title:item.title,date:item.date,audience:item.audience,image:item.cover,photos:item.slides,body:item.stat,home:index < 6})); break;
    case "albums": {
      const remote = albums ?? [];
      defaults = [
        ...remote.filter(item => item.slug).map(item => ({id:item.slug,slug:item.slug,title:item.title,date:item.eventDate,category:item.category,image:item.cover,photos:item.photos?.filter(photo => photo.src)})),
        ...[...communityAlbums, ...fall26Albums].filter(item => !remote.some(row => row.slug === item.slug)).map(item => ({id:item.slug, slug:item.slug,title:item.title,date:item.eventDate,category:item.category,image:item.coverImageUrl,
          photos:item.photos.map(photo => ({src:photo.url,alt:photo.caption || ""}))})),
      ];
      break;
    }
    case "board": defaults = roles.map(([id,role,field]) => ({id, role,title:leadership?.[field] || "TBD"})); break;
    case "partners": defaults = PARTNERS.map(item => ({id:item.shortName.replace(/[^a-zA-Z0-9]+/g,"-"),title:item.name,role:item.group,url:item.href,image:item.src?.replace(/\.[^.]+$/, ".webp")})); break;
    case "hero": defaults = [
      ...daylightWall.map(id => ({id:"day-"+id,title:id,role:"day", image: communityPhoto(id).src})),
      ...eveningWall.map(id => ({id:"night-"+id,title:id,role:"night",image:communityPhoto(id).src})),
    ]; break;
  }
  const saved = getCollection(fields,type);
  return <Records type={type} items={saved ?? defaults} selected={selected} setSelected={setSelected} pick={pick}
    save={items => change(visualKey.collection + type,{kind:"collection",type,items})}/>;
}

export default function Collections({ fields, change, pick }: {fields:Fields;change:Change;pick:Picker}) {
  const [type,setType] = useState<CollectionType>("stories");
  return <>
    <label>Collection<select value={type} onChange={event => setType(event.target.value as CollectionType)}>
      {Object.entries(labels).map(([key,label]) => <option key={key} value={key}>{label}</option>)}
    </select></label>
    <SeededRecords key={type} type={type} fields={fields} change={change} pick={pick}/>
  </>;
}
