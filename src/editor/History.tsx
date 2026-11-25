import {useEffect,useState} from "react";
import type {Session} from "@supabase/supabase-js";
import {request,messageOf} from "./ManagementLogin";
import type {Fields} from "./content";
type Row={id:string;actor:string;date:string;action:string;count:number;pages:string[]};
export default function History({session,owner=false,onRestore,onClose}:{session:Session;owner?:boolean;onRestore?:()=>void;onClose?:()=>void}){
  const [rows,setRows]=useState<Row[]>([]),[more,setMore]=useState(false),[dataset,setDataset]=useState(""),[search,setSearch]=useState(""),[detail,setDetail]=useState<Row & {before:Fields;after:Fields}>(),[notice,setNotice]=useState(""),[busy,setBusy]=useState(false);
  async function run(task:()=>Promise<void>){setBusy(true);setNotice("");try{await task();}catch(e){setNotice(messageOf(e));}finally{setBusy(false);}}
  async function load(offset=0){const r=await request(session,{action:"history",offset});setDataset(r.dataset);setRows(old=>offset?[...old,...r.rows]:r.rows);setMore(r.rows.length===40);}
  useEffect(()=>{void run(()=>load());},[session.user.id]);
  async function restore(side:string,field?:string,page?:string){
    const live=await fetch("/api/site-editor",{cache:"no-store"});if(!live.ok)throw Error("Unable to check current revision.");
    const {revision}=await live.json();
    if(!confirm("Restore "+(field || page || "all editor content")+" in "+dataset+"? This publishes a new version."))return;
    await request(session,{action:"restore",id:detail?.id,side,field,page,revision});await load();onRestore?.();setNotice("Restoration published.");
  }
  return <section className="msa-history" aria-label="Content history"><h2>Content history · {dataset}</h2>{onClose&&<button onClick={onClose}>Close history</button>}
    <label>Search loaded versions by account, date, action or page<input value={search} onChange={e=>setSearch(e.target.value)}/></label>
    {owner&&<><button disabled={busy} onClick={()=>run(async()=>{await request(session,{action:"snapshot"});await load();})}>Create editor snapshot</button><button disabled={busy} onClick={()=>run(async()=>{const data=await request(session,{action:"export"});const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="msa-"+dataset+"-editor.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);})}>Export published editor content</button></>}
    <ul>{rows.filter(r=>[r.actor,r.date,r.action,...r.pages].join(" ").toLowerCase().includes(search.toLowerCase())).map(r=><li key={r.id}><button disabled={busy} onClick={()=>run(async()=>setDetail(await request(session,{action:"version",id:r.id})))}>{new Date(r.date).toLocaleString()} · {r.action} · {r.actor} · {r.count} fields</button></li>)}</ul>
    {!rows.length&&!busy&&<p>No recorded versions.</p>}{more&&<button disabled={busy} onClick={()=>run(()=>load(rows.length))}>Load older versions</button>}
    {detail&&<article><h3>{detail.action} · {new Date(detail.date).toLocaleString()}</h3><p>Version {detail.id}</p>
    <button disabled={busy} onClick={()=>run(()=>restore("after"))}>Restore this version</button>{detail.action!=="snapshot"&&<button disabled={busy} onClick={()=>run(()=>restore("before"))}>Restore previous state</button>}
    {detail.pages.map(p=><button disabled={busy} key={p} onClick={()=>run(()=>restore("after",undefined,p))}>Restore {p}</button>)}
    {Array.from(new Set([...Object.keys(detail.before),...Object.keys(detail.after)])).filter(k=>detail.action==="snapshot"||JSON.stringify(detail.before[k])!==JSON.stringify(detail.after[k])).map(k=><details key={k}><summary>{k}</summary><strong>Before</strong><pre>{JSON.stringify(detail.before[k]??null,null,2)}</pre><strong>After</strong><pre>{JSON.stringify(detail.after[k]??null,null,2)}</pre><button disabled={busy} onClick={()=>run(()=>restore("after",k))}>Restore field</button></details>)}</article>}
    <p role="status">{notice}</p></section>;
}
