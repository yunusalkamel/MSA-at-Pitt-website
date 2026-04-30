import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import patternImg from "@/assets/islamic-pattern.jpg";

const STORAGE_KEY = "msa-board-2526";

const ROLES_INIT = [
  {id:'president',role:'President',color:'c-navy',tier:'exec',members:[{name:'',label:''}],min:1,max:1},
  {id:'secretary',role:'Secretary',color:'c-gray',tier:'vp',branch:'left',members:[{name:'',label:''}],min:1,max:4},
  {id:'ext-vp',role:'External',color:'c-gold',tier:'vp',branch:'center',members:[{name:'',label:''}],min:1,max:1},
  {id:'int-vp',role:'Internal',color:'c-gold',tier:'vp',branch:'center',members:[{name:'',label:''}],min:1,max:1},
  {id:'biz-mgr',role:'Business Manager',color:'c-green',tier:'vp',branch:'right',members:[{name:'',label:''}],min:1,max:1},
  {id:'cec',role:'Community Engagement Council',color:'c-teal',tier:'chair',branch:'ext',
    members:[{name:'',label:'Chair'},{name:'',label:'Attawheed'},{name:'',label:'ICWP/MAP'},{name:'',label:'ICP'},{name:'',label:'MCCGP'}],
    min:5,max:7},
  {id:'advocacy',role:'Advocacy Chair',color:'c-coral',tier:'chair',branch:'ext',members:[{name:'',label:'Chair'},{name:'',label:''}],min:1,max:4},
  {id:'bros-dawah',role:"Brothers Da'wah",color:'c-blue',tier:'chair',branch:'ext',
    members:[{name:'',label:'Chair'},{name:'',label:''},{name:'',label:'Chaplain',noCount:true,pinBottom:true}],
    min:3,max:6},
  {id:'sis-dawah',role:"Sisters Da'wah",color:'c-pink',tier:'chair',branch:'ext',
    members:[{name:'',label:'Chair'},{name:'',label:''},{name:'',label:''}],
    min:2,max:5},
  {id:'bros-social',role:'Brothers Social',color:'c-purple',tier:'chair',branch:'int',
    members:[{name:'',label:'Chair'},{name:'',label:'Mentorship/freshman lead'},{name:'',label:''},{name:'',label:''}],
    min:2,max:6},
  {id:'sis-social',role:'Sisters Social',color:'c-amber',tier:'chair',branch:'int',
    members:[{name:'',label:'Chair'},{name:'',label:'Mentorship/freshman lead'},{name:'',label:''},{name:'',label:''}],
    min:2,max:6},
  {id:'marketing',role:'Marketing Chair',color:'c-red',tier:'chair',branch:'int',
    members:[{name:'',label:'Chair'},{name:'',label:''},{name:'',label:''}],
    min:1,max:5},
];

const OrgChart = () => {
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const appEl = document.getElementById("oc-app")!;
    const chartWrap = document.getElementById("oc-wrap")!;
    const svgLines = document.getElementById("oc-svg") as unknown as SVGSVGElement;
    const statTotal = document.getElementById("oc-total")!;
    const statSlots = document.getElementById("oc-slots")!;
    const statDedup = document.getElementById("oc-dedup")!;

    // Load persisted state or fall back to defaults
    let saved: any = null;
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch(_) {}
    let state: any[] = saved?.roles ? saved.roles : JSON.parse(JSON.stringify(ROLES_INIT));
    let prospects: any[] = saved?.prospects || [{name:'',role:''},{name:'',role:''},{name:'',role:''}];

    function persist() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ roles: state, prospects })); } catch(_) {}
    }

    function updateStats() {
      let totalSlots = 0;
      const allNames: string[] = [];
      state.forEach((s: any) => {
        s.members.forEach((m: any) => {
          if (m.noCount) return;
          totalSlots++;
          if (m.name.trim()) allNames.push(m.name.trim().toLowerCase());
        });
      });
      const unique = new Set(allNames).size;
      const dupes = allNames.length - unique;
      const unfilled = totalSlots - allNames.length;
      statSlots.textContent = `${totalSlots} slots`;
      statTotal.textContent = `${unique} unique` + (unfilled > 0 ? ` · ${unfilled} open` : "");
      if (dupes > 0) { statDedup.style.display = ""; statDedup.textContent = `${dupes} shared`; }
      else { statDedup.style.display = "none"; }
    }

    function buildMemberRow(s: any, m: any, i: number) {
      const row = document.createElement("div");
      row.className = "oc-member-row";
      const inp = document.createElement("input");
      inp.type = "text"; inp.value = m.name; inp.placeholder = m.label || "Member name";
      inp.addEventListener("input", (e: any) => { m.name = e.target.value; updateStats(); persist(); });
      if (m.noCount) inp.style.fontStyle = "italic";
      row.appendChild(inp);
      if (m.label) {
        const sub = document.createElement("span");
        const isChair = m.label === "Chair", isChaplain = m.label === "Chaplain";
        sub.className = "oc-sub-label" + (isChair ? " oc-chair" : "") + (isChaplain ? " oc-chaplain" : "");
        sub.textContent = (isChair ? "★ " : "") + m.label;
        row.appendChild(sub);
      }
      if (s.members.length > s.min && !m.noCount && !m.pinBottom) {
        const rm = document.createElement("button");
        rm.className = "oc-rm"; rm.innerHTML = "&times;";
        rm.addEventListener("click", () => { s.members.splice(i, 1); persist(); render(); });
        row.appendChild(rm);
      }
      return row;
    }

    function buildNode(s: any) {
      const el = document.createElement("div");
      el.className = `oc-node ${s.color}`;
      el.setAttribute("data-role-id", s.id);
      const count = s.members.filter((m: any) => !m.noCount).length;
      el.innerHTML = `<div class="oc-node-header"><span class="oc-role-label">${s.role}</span><span class="oc-tag">${count}</span></div>`;
      const body = document.createElement("div");
      body.className = "oc-node-body";
      const regular: any[] = [], pinned: any[] = [];
      s.members.forEach((m: any, i: number) => { if (m.pinBottom) pinned.push({m,i}); else regular.push({m,i}); });
      regular.forEach(({m,i}: any) => body.appendChild(buildMemberRow(s,m,i)));
      if (s.members.filter((m: any) => !m.pinBottom).length < s.max - pinned.length) {
        const add = document.createElement("button");
        add.className = "oc-add"; add.textContent = "+ add member";
        add.addEventListener("click", () => {
          const pi = s.members.findIndex((m: any) => m.pinBottom);
          if (pi !== -1) s.members.splice(pi, 0, {name:'',label:''});
          else s.members.push({name:'',label:''});
          persist(); render();
        });
        body.appendChild(add);
      }
      if (pinned.length) {
        body.appendChild(Object.assign(document.createElement("hr"), {className:"oc-sep"}));
        pinned.forEach(({m,i}: any) => body.appendChild(buildMemberRow(s,m,i)));
      }
      el.appendChild(body);
      return el;
    }

    function buildProspects() {
      const box = document.createElement("div");
      box.className = "oc-prospect-box";
      box.innerHTML = `<div class="oc-node-header" style="background:#f7f7f7;color:#777;border-bottom:1px dashed #ddd"><span class="oc-role-label">Prospective members</span><span class="oc-tag" style="background:rgba(0,0,0,.06);color:#999">${prospects.length}</span></div>`;
      const body = document.createElement("div");
      body.className = "oc-node-body";
      prospects.forEach((p: any, i: number) => {
        const row = document.createElement("div");
        row.className = "oc-prospect-row";
        const ni = document.createElement("input");
        ni.className = "oc-name-inp"; ni.type = "text"; ni.value = p.name; ni.placeholder = "Name";
        ni.addEventListener("input", (e: any) => { p.name = e.target.value; persist(); });
        row.appendChild(ni);
        const ri = document.createElement("input");
        ri.className = "oc-role-inp"; ri.type = "text"; ri.value = p.role; ri.placeholder = "Potential role";
        ri.addEventListener("input", (e: any) => { p.role = e.target.value; persist(); });
        row.appendChild(ri);
        if (prospects.length > 1) {
          const rm = document.createElement("button");
          rm.className = "oc-rm"; rm.innerHTML = "&times;";
          rm.addEventListener("click", () => { prospects.splice(i,1); persist(); render(); });
          row.appendChild(rm);
        }
        body.appendChild(row);
      });
      const add = document.createElement("button");
      add.className = "oc-add"; add.textContent = "+ add prospect";
      add.addEventListener("click", () => { prospects.push({name:'',role:''}); persist(); render(); });
      body.appendChild(add);
      box.appendChild(body);
      return box;
    }

    function getNodeCenter(id: string, side: string) {
      const el = chartWrap.querySelector(`[data-role-id="${id}"]`);
      if (!el) return null;
      const wr = chartWrap.getBoundingClientRect(), r = el.getBoundingClientRect();
      if (side === "top")    return { x: r.left-wr.left+r.width/2, y: r.top-wr.top };
      if (side === "bottom") return { x: r.left-wr.left+r.width/2, y: r.top-wr.top+r.height };
      return { x: r.left-wr.left+r.width/2, y: r.top-wr.top+r.height/2 };
    }
    function getBranchCenter(branchId: string, side: string) {
      const el = chartWrap.querySelector(`[data-branch-id="${branchId}"]`);
      if (!el) return null;
      const wr = chartWrap.getBoundingClientRect(), r = el.getBoundingClientRect();
      if (side === "top") return { x: r.left-wr.left+r.width/2, y: r.top-wr.top };
      return { x: r.left-wr.left+r.width/2, y: r.top-wr.top+r.height };
    }
    function drawLine(from: any, to: any, color: string) {
      if (!from || !to) return;
      const path = document.createElementNS("http://www.w3.org/2000/svg","path");
      const my = (from.y + to.y) / 2;
      path.setAttribute("d", `M${from.x},${from.y} C${from.x},${my} ${to.x},${my} ${to.x},${to.y}`);
      path.setAttribute("fill","none"); path.setAttribute("stroke", color||"#d0d0d0"); path.setAttribute("stroke-width","1.5");
      svgLines.appendChild(path);
    }
    function drawLines() {
      svgLines.innerHTML = "";
      const wr = chartWrap.getBoundingClientRect();
      svgLines.setAttribute("width", String(wr.width)); svgLines.setAttribute("height", String(wr.height));
      ["secretary","ext-vp","int-vp","biz-mgr"].forEach(id => drawLine(getNodeCenter("president","bottom"), getNodeCenter(id,"top"), "#ccc"));
      drawLine(getNodeCenter("ext-vp","bottom"), getBranchCenter("ext-branch","top"), "#d4a96a");
      drawLine(getNodeCenter("int-vp","bottom"), getBranchCenter("int-branch","top"), "#d4a96a");
    }

    function render() {
      appEl.innerHTML = "";

      // Exec
      const exec = document.createElement("div"); exec.className = "oc-tier";
      exec.innerHTML = `<div class="oc-tier-label">Executive Board</div>`;
      const execRow = document.createElement("div"); execRow.className = "oc-tier-row";
      state.filter((s:any)=>s.tier==="exec").forEach((s:any)=>execRow.appendChild(buildNode(s)));
      exec.appendChild(execRow); appEl.appendChild(exec);

      // VPs
      const vp = document.createElement("div"); vp.className = "oc-tier";
      const vpRow = document.createElement("div"); vpRow.className = "oc-vp-row";
      const left = document.createElement("div"); left.className = "oc-vp-side";
      state.filter((s:any)=>s.tier==="vp"&&s.branch==="left").forEach((s:any)=>left.appendChild(buildNode(s)));
      const center = document.createElement("div"); center.className = "oc-vp-center";
      state.filter((s:any)=>s.tier==="vp"&&s.branch==="center").forEach((s:any)=>center.appendChild(buildNode(s)));
      const right = document.createElement("div"); right.className = "oc-vp-side";
      state.filter((s:any)=>s.tier==="vp"&&s.branch==="right").forEach((s:any)=>right.appendChild(buildNode(s)));
      vpRow.appendChild(left); vpRow.appendChild(center); vpRow.appendChild(right);
      vp.appendChild(vpRow); appEl.appendChild(vp);

      // Committees
      const comm = document.createElement("div"); comm.className = "oc-tier";
      comm.innerHTML = `<div class="oc-tier-label">Committees</div>`;
      const commRow = document.createElement("div"); commRow.className = "oc-comm-row";
      // External
      const extB = document.createElement("div"); extB.className = "oc-branch"; extB.setAttribute("data-branch-id","ext-branch");
      extB.innerHTML = `<div class="oc-branch-label"><span class="oc-branch-line"></span>External<span class="oc-branch-line"></span></div>`;
      const extRow = document.createElement("div"); extRow.className = "oc-branch-row";
      state.filter((s:any)=>s.tier==="chair"&&s.branch==="ext").forEach((s:any)=>extRow.appendChild(buildNode(s)));
      extB.appendChild(extRow); commRow.appendChild(extB);
      // Internal
      const intB = document.createElement("div"); intB.className = "oc-branch"; intB.setAttribute("data-branch-id","int-branch");
      intB.innerHTML = `<div class="oc-branch-label"><span class="oc-branch-line"></span>Internal<span class="oc-branch-line"></span></div>`;
      const intRow = document.createElement("div"); intRow.className = "oc-branch-row";
      state.filter((s:any)=>s.tier==="chair"&&s.branch==="int").forEach((s:any)=>intRow.appendChild(buildNode(s)));
      intB.appendChild(intRow); commRow.appendChild(intB);
      comm.appendChild(commRow); appEl.appendChild(comm);

      // Pipeline
      const pipe = document.createElement("div"); pipe.className = "oc-tier";
      pipe.innerHTML = `<div class="oc-tier-label">Pipeline</div>`;
      const pipeRow = document.createElement("div"); pipeRow.className = "oc-tier-row";
      pipeRow.appendChild(buildProspects()); pipe.appendChild(pipeRow); appEl.appendChild(pipe);

      // Legend
      const legend = document.createElement("div"); legend.className = "oc-legend";
      [{l:"President",bg:"#E6F1FB"},{l:"External / Internal",bg:"#FAEEDA"},{l:"Secretary",bg:"#F1EFE8"},{l:"Business Mgr",bg:"#EAF3DE"},
       {l:"CEC",bg:"#E1F5EE"},{l:"Advocacy",bg:"#FAECE7"},{l:"Da'wah (B)",bg:"#dbeeff"},{l:"Da'wah (S)",bg:"#FBEAF0"},
       {l:"Social (B)",bg:"#EEEDFE"},{l:"Social (S)",bg:"#FFF3D6"},{l:"Marketing",bg:"#FCEBEB"}].forEach(c => {
        const item = document.createElement("span"); item.className = "oc-legend-item";
        item.innerHTML = `<span class="oc-legend-dot" style="background:${c.bg}"></span>${c.l}`;
        legend.appendChild(item);
      });
      appEl.appendChild(legend);

      // Reset button
      const resetWrap = document.createElement("div"); resetWrap.style.cssText = "display:flex;justify-content:flex-end;margin-top:.75rem";
      const resetBtn = document.createElement("button"); resetBtn.className = "oc-reset-btn"; resetBtn.textContent = "Reset board";
      resetBtn.onclick = () => {
        if (!confirm("Clear all names and reset the board?")) return;
        localStorage.removeItem(STORAGE_KEY);
        state = JSON.parse(JSON.stringify(ROLES_INIT));
        prospects = [{name:'',role:''},{name:'',role:''},{name:'',role:''}];
        render();
      };
      resetWrap.appendChild(resetBtn); appEl.appendChild(resetWrap);

      updateStats();
      requestAnimationFrame(() => requestAnimationFrame(drawLines));
    }

    window.addEventListener("resize", drawLines);
    render();

    return () => { window.removeEventListener("resize", drawLines); };
  }, []);

  return (
    <Layout>
      <style>{`
        .oc-tier{margin-bottom:1.5rem;position:relative;z-index:2}
        .oc-tier-label{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.8px;color:hsl(var(--muted-foreground));padding:0 4px 8px;border-bottom:1px solid hsl(var(--border));margin-bottom:12px;font-family:var(--font-body)}
        .oc-tier-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
        .oc-vp-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:flex-start}
        .oc-vp-side{display:flex;flex-direction:column;gap:10px;flex:0 0 auto}
        .oc-vp-center{display:flex;gap:12px;flex:0 0 auto}
        .oc-branch{background:rgba(255,252,246,.7);border:.5px solid hsl(var(--border));border-radius:14px;padding:14px 14px 10px}
        .oc-branch-label{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.8px;color:hsl(var(--muted-foreground));margin-bottom:10px;padding-left:2px;display:flex;align-items:center;gap:6px;justify-content:center;font-family:var(--font-body)}
        .oc-branch-line{flex:1;height:0;border-top:1px solid hsl(var(--border));max-width:40px}
        .oc-branch-row{display:flex;flex-wrap:wrap;gap:12px}
        .oc-comm-row{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
        .oc-comm-row>.oc-branch{flex:1;min-width:300px;max-width:540px}
        .oc-node{border-radius:10px;border:.5px solid hsl(var(--border));background:hsl(var(--card));min-width:165px;max-width:220px;flex:1;transition:box-shadow .15s;position:relative}
        .oc-node:hover{box-shadow:0 2px 8px rgba(17,35,60,.08)}
        .oc-node-header{padding:8px 12px;font-weight:500;font-size:13px;border-bottom:.5px solid hsl(var(--border));display:flex;justify-content:space-between;align-items:center;border-radius:10px 10px 0 0;font-family:var(--font-body)}
        .oc-role-label{flex:1;line-height:1.3}
        .oc-tag{font-size:10px;font-weight:500;padding:2px 7px;border-radius:10px;white-space:nowrap;margin-left:6px;background:rgba(0,0,0,.06);color:inherit;font-family:var(--font-body)}
        .oc-node-body{padding:6px 12px 8px}
        .oc-member-row{display:flex;align-items:center;gap:5px;padding:2px 0;font-size:12px}
        .oc-member-row input{border:none;background:transparent;font-size:12px;font-family:var(--font-body);color:hsl(var(--foreground));outline:none;flex:1;padding:3px 5px;border-radius:4px;min-width:0}
        .oc-member-row input:hover,.oc-member-row input:focus{background:hsl(var(--muted)/.5)}
        .oc-member-row input::placeholder{color:hsl(var(--muted-foreground)/.5)}
        .oc-sub-label{font-size:10px;color:hsl(var(--muted-foreground));white-space:nowrap;flex-shrink:0;font-family:var(--font-body)}
        .oc-chair{color:#0C447C;font-weight:500}
        .oc-chaplain{color:hsl(var(--muted-foreground));font-style:italic}
        .oc-rm{font-size:13px;color:hsl(var(--muted-foreground)/.4);cursor:pointer;padding:0 2px;border:none;background:none;line-height:1;flex-shrink:0}
        .oc-rm:hover{color:#e24b4a}
        .oc-add{font-size:11px;color:#185FA5;cursor:pointer;padding:3px 0;border:none;background:none;font-family:var(--font-body);display:block;width:100%;text-align:left}
        .oc-add:hover{text-decoration:underline}
        .oc-sep{border:none;border-top:1px dashed hsl(var(--border));margin:4px 0}
        .oc-prospect-box{border:1.5px dashed hsl(var(--border));border-radius:10px;background:hsl(var(--card)/.7);width:300px}
        .oc-prospect-row{display:flex;align-items:center;gap:5px;padding:2px 0;font-size:12px;font-family:var(--font-body)}
        .oc-name-inp{border:none;background:transparent;font-size:12px;font-family:var(--font-body);outline:none;padding:3px 5px;border-radius:4px;flex:1;color:hsl(var(--foreground))}
        .oc-role-inp{border:none;background:transparent;font-size:12px;font-family:var(--font-body);outline:none;padding:3px 5px;border-radius:4px;width:95px;color:hsl(var(--muted-foreground));font-style:italic;flex-shrink:0}
        .oc-name-inp:hover,.oc-name-inp:focus,.oc-role-inp:hover,.oc-role-inp:focus{background:hsl(var(--muted)/.5)}
        .oc-name-inp::placeholder{color:hsl(var(--muted-foreground)/.4)}
        .oc-role-inp::placeholder{color:hsl(var(--muted-foreground)/.3)}
        .oc-legend{display:flex;flex-wrap:wrap;gap:6px 14px;padding:10px 0 0;font-size:11px;color:hsl(var(--muted-foreground));justify-content:center;font-family:var(--font-body)}
        .oc-legend-item{display:flex;align-items:center;gap:4px}
        .oc-legend-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;border:1px solid rgba(0,0,0,.08)}
        .oc-reset-btn{font-size:11px;color:hsl(var(--muted-foreground));background:transparent;border:.5px solid hsl(var(--border));border-radius:7px;padding:.2rem .6rem;cursor:pointer;font-family:var(--font-body);transition:all .14s}
        .oc-reset-btn:hover{border-color:#e24b4a;color:#e24b4a}
        /* Node color headers */
        .c-navy .oc-node-header{background:#E6F1FB;color:#0C447C}
        .c-gold .oc-node-header{background:#FAEEDA;color:#633806}
        .c-teal .oc-node-header{background:#E1F5EE;color:#085041}
        .c-purple .oc-node-header{background:#EEEDFE;color:#3C3489}
        .c-coral .oc-node-header{background:#FAECE7;color:#712B13}
        .c-pink .oc-node-header{background:#FBEAF0;color:#72243E}
        .c-green .oc-node-header{background:#EAF3DE;color:#27500A}
        .c-gray .oc-node-header{background:#F1EFE8;color:#444441}
        .c-blue .oc-node-header{background:#dbeeff;color:#0C447C}
        .c-amber .oc-node-header{background:#FFF3D6;color:#633806}
        .c-red .oc-node-header{background:#FCEBEB;color:#791F1F}
      `}</style>

      {/* Hero */}
      <section className="relative py-28 md:py-36 text-center px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-gold" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage:`url(${patternImg})`, backgroundSize:"200px" }} />
        <BridgeBar />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-5">2025–26</motion.p>
          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4">
            MSA <span className="text-gradient-gold">Board</span>
          </motion.h1>
          <motion.p initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.2}} className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Organizational structure and board roster
          </motion.p>
        </div>
      </section>

      <section className="py-10 px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.1}} className="glass-card rounded-2xl p-6">

            {/* Top bar */}
            <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
              <div className="flex items-baseline gap-3">
                <h2 className="font-display text-2xl font-bold text-foreground">Pitt MSA Board</h2>
                <span className="text-sm text-muted-foreground font-body">2025–26</span>
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <span id="oc-slots" className="text-sm font-medium px-3 py-1 rounded-full" style={{background:"#EAF3DE",color:"#27500A"}}>0 slots</span>
                <span id="oc-total" className="text-sm font-medium px-3 py-1 rounded-full" style={{background:"#E6F1FB",color:"#0C447C"}}>0 unique</span>
                <span id="oc-dedup" className="text-xs font-medium px-3 py-1 rounded-full" style={{background:"#FAEEDA",color:"#633806",display:"none"}}></span>
              </div>
            </div>

            {/* Chart */}
            <div style={{position:"relative"}} id="oc-wrap">
              <svg id="oc-svg" style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1}}></svg>
              <div id="oc-app"></div>
            </div>

          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default OrgChart;
