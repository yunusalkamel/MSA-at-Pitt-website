import { useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { designChoices, originalDesign } from "../../shared/design-options.js";
import type { DesignOptions } from "@/design/useDesign";
import { builtInPages, visualKey } from "./visual-model";
import type { Fields } from "./content";
import VisualPreview, { type Device } from "./VisualPreview";
import { messageOf, request } from "./ManagementLogin";

type Profile = {name:string;options:DesignOptions};
type Snapshot = {
  revision: string | null;
  profileRevision: string | null;
  fields: Fields;
  profiles: Profile[];
};

export default function OwnerDesign({ session }: { session: Session }) {
  const [data,setData] = useState<Snapshot>();
  const [options,setOptions] = useState<DesignOptions>({});
  const [name,setName] = useState("");
  const [path,setPath] = useState("/");
  const [device,setDevice] = useState<Device>("desktop");
  const [preview,setPreview] = useState<"a"|"b"|"both">();
  const [busy,setBusy] = useState(false);
  const [status,setStatus] = useState("");
  const active = data?.fields[visualKey.design];
  const siteOptions = active?.kind === "design" ? active.options : {};
  const call = (action:string, values:object = {}) => request(session,{action,...values});
  async function run(fn:()=>Promise<void>) {
    setBusy(true); setStatus("");
    try { await fn(); } catch(error) { setStatus(messageOf(error)); }
    finally { setBusy(false); }
  }
  async function load() {
    const result:Snapshot = await call("design_load");
    setData(result);
    const design = result.fields[visualKey.design];
    setOptions(design?.kind === "design" ? design.options : {});
  }
  async function save(profiles:Profile[]) {
    const result = await call("design_save",{profiles, profileRevision:data.profileRevision});
    setData({...data,profiles,profileRevision:result.profileRevision});
    setStatus("Design presets saved.");
  }

  return <section id="Design">
    <h2>Design</h2>
    <p>Try combinations of the original design review options. The published configuration stays in place until you publish.</p>
    {!data ? <button disabled={busy} onClick={() => run(load)}>Open design controls</button> : <>
      <div className="msa-design-choices">
        {Object.entries(designChoices).map(([id, control]) => <label key={id}>{control.label}
          <select disabled={busy} value={options[id] ?? "site"} onChange={event => {
            const next = {...options};
            if (event.target.value === "site") delete next[id];
            else next[id] = event.target.value;
            setOptions(next);
          }}>{Object.entries(control.choices).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>
        </label>)}
      </div>
      <fieldset disabled={busy}>
        <legend>Compare designs</legend>
        <label>Page<select value={path} onChange={event => setPath(event.target.value)}>
          {Object.entries(builtInPages).map(([url,title]) => <option key={url} value={url}>{title}</option>)}
        </select></label>
        <label>Viewport<select value={device} onChange={event => setDevice(event.target.value as Device)}>
          <option value="desktop">Desktop</option><option value="tablet">Tablet</option><option value="phone">Phone</option>
        </select></label>
        <button onClick={() => setPreview("a")}>A · Published</button>
        <button onClick={() => setPreview("b")}>B · Working design</button>
        <button onClick={() => setPreview("both")}>Compare A and B</button>
      </fieldset>
      <fieldset disabled={busy}>
        <legend>Presets</legend>
        <button onClick={() => setOptions({})}>Use current production default</button>
        <button onClick={() => setOptions(originalDesign)}>Use original comparison preset</button>
        <button onClick={() => setOptions(siteOptions)}>Revert working changes</button>
        <label>Preset name<input value={name} maxLength={70} onChange={event => setName(event.target.value)}/></label>
        <button disabled={!name.trim()} onClick={() => run(() => save([...data.profiles.filter(profile=>profile.name !== name.trim()),{name:name.trim(),options}]))}>Save preset</button>
        {data.profiles.map(profile => <div className="msa-design-preset" key={profile.name}>
          <strong>{profile.name}</strong><button onClick={() => {setOptions(profile.options);setName(profile.name);}}>Load</button>
          <button onClick={() => run(() => save(data.profiles.filter(item=>item.name !== profile.name)))}>Remove</button>
        </div>)}
      </fieldset>
      <button disabled={busy} onClick={() => run(async () => {
        const result = await call("design_publish",{ revision:data.revision, design:{kind:"design",options} });
        await load();
        setStatus(result.warning || (result.unchanged ? "This design is already published." : "Design published to this environment."));
      })}>Publish design</button>{" "}<a href="#Activity">Restore a published design from History</a>
      {preview && <VisualPreview fields={preview === "a" ? data.fields : {...data.fields,[visualKey.design]:{kind:"design",options}}}
        compare={preview === "both" ? data.fields : undefined} path={path} device={device} onClose={() => setPreview(undefined)}/>}
    </>}
    <p role="status">{busy ? "Working…" : status}</p>
  </section>;
}
