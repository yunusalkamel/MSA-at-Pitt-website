import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TextField, usePlainTextField } from "@/editor/content";
import { usePrayerSchedule } from "@/hooks/usePrayerSchedule";
import { fm } from "@/lib/prayerClock";

declare global { interface Window { Chart: any; } }

const MN = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
const MNS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
type DayEntry = { yr: number; mo: number; d: number; lbl: string;
  Fajr: number|null; Sunrise: number|null; Dhuhr: number|null;
  Asr: number|null; Maghrib: number|null; Isha: number|null; };

function buildDays(onDate: ReturnType<typeof usePrayerSchedule>["onDate"]): DayEntry[] {
  const days: DayEntry[] = [];
  for (let y = 2026; y <= 2028; y++)
    for (let m = 1; m <= 12; m++)
      for (let d = 1, dim = new Date(y, m, 0).getDate(); d <= dim; d++)
        days.push({ yr: y, mo: m, d, lbl: `${MNS[m-1]} ${d}`, ...onDate(y, m, d) });
  return days;
}

function zoneIdx(days: DayEntry[], yr: number, mo: number, d: number) {
  return days.findIndex(a => a.yr === yr && a.mo === mo && a.d === d);
}
function buildZones(days: DayEntry[]) {
  const i = (y: number, m: number, d: number) => zoneIdx(days, y, m, d);
  const RAM = [
    [i(2026,2,18), i(2026,3,19)], [i(2027,2,7), i(2027,3,8)], [i(2028,1,28), i(2028,2,26)],
  ];
  const BRK = [
    [i(2026,10,9), i(2026,10,11)], [i(2026,11,22), i(2026,11,29)],
    [i(2026,12,13), i(2027,1,10)], [i(2027,3,7), i(2027,3,13)],
  ];
  return { RAM, BRK };
}

const PC = [
  { n:"Fajr",    c:"#EF7C1A", k:"Fajr",    p:0 },
  { n:"Shuruq",  c:"#EFC11A", k:"Sunrise", p:0 },
  { n:"Dhuhr",   c:"#97C459", k:"Dhuhr",   p:1 },
  { n:"Asr",     c:"#3B6D11", k:"Asr",     p:1 },
  { n:"Maghrib", c:"#378ADD", k:"Maghrib", p:1 },
  { n:"Isha",    c:"#7F77DD", k:"Isha",    p:1 },
];

export default function SolarAlmanac({ west, setWest }: { west: boolean; setWest: (value: boolean) => void }) {
  const { date, onDate } = usePrayerSchedule(west ? "west" : "oakland");
  const locationLabels = [
    usePlainTextField("Prayer_6", "ICP", ["/resources/prayer-times/PrayerTimes_8"]),
    usePlainTextField("Prayer_7", "Oakland", ["/resources/prayer-times/PrayerTimes_9"]),
    usePlainTextField("Prayer_8", "Attawheed", ["/resources/prayer-times/PrayerTimes_10"]),
    usePlainTextField("Prayer_9", "Carnegie", ["/resources/prayer-times/PrayerTimes_11"]),
  ];
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const lifecycle = new AbortController();
    const canvases = ["ctop","cbot"].map(id => document.getElementById(id));
    let script = document.getElementById("chartjs-cdn");
    if (!script) {
      script = document.createElement("script");
      script.id = "chartjs-cdn";
      (script as HTMLScriptElement).src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
      document.head.appendChild(script);
    }
    if (window.Chart) boot(lifecycle.signal);
    else script.addEventListener("load", () => boot(lifecycle.signal), { once: true, signal: lifecycle.signal });

    return () => {
      lifecycle.abort();
      initRef.current = false;
      canvases.forEach(el => {
        if (el) window.Chart?.getChart?.(el)?.destroy();
      });
    };
  }, [onDate, date.year, date.month, date.day]);

  function boot(signal: AbortSignal) {
    const Chart = window.Chart;
    if (!Chart) return;

    const allDays = buildDays(onDate);
    const { RAM: RAM_BLOCKS, BRK: BRK_BLOCKS } = buildZones(allDays);
    const TI = allDays.findIndex(x => x.yr === date.year && x.mo === date.month && x.d === date.day);
    const SPANS: Record<string,number> = { "1mo":35, "6mo":182, "year":365 };
    let curSpan = SPANS["year"];
    let winStart = Math.max(0, TI >= 0 ? TI - 7 : 0);
    let topCh: any = null, botCh: any = null;
    let aIdx = TI;
    let vis = [true,true,true,true,true,true];
    let dragging = false, dragClientX = 0, dragWinStart = 0, rafId: number|null = null;
    signal.addEventListener("abort", () => { if (rafId != null) cancelAnimationFrame(rafId); }, { once: true });

    function clamp() { winStart = Math.max(0, Math.min(allDays.length-1-curSpan, winStart)); }
    function getWin() { clamp(); return { min: winStart-.5, max: winStart+curSpan+.5 }; }
    function updateLabel() {
      const si = Math.max(0, Math.round(winStart)), ei = Math.min(allDays.length-1, Math.round(winStart+curSpan));
      const s = allDays[si], e = allDays[ei];
      const el = document.getElementById("range-label");
      if (el && s && e) el.textContent = `${MN[s.mo].slice(0,3)} ${s.yr} – ${MN[e.mo].slice(0,3)} ${e.yr}`;
    }
    function applyWin(fast?: boolean) {
      if (!topCh || !botCh) return;
      const { min, max } = getWin();
      [topCh, botCh].forEach(c => { c.options.scales.x.min = min; c.options.scales.x.max = max; c.update(fast ? "none" : undefined); });
      updateLabel();
      drawMinimap();
    }
    const styles = getComputedStyle(document.documentElement);
    const gold = styles.getPropertyValue("--gold-muted").trim();
    const goldAt = (alpha: number) => {
      const value = parseInt(gold.slice(1), 16);
      return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
    };
    const F = "'Plus Jakarta Sans',system-ui,sans-serif";
    const G = "rgba(17,35,60,.065)", TK = "rgba(17,35,60,.38)";

    const todayPlug = { id:"tl", afterDraw(c: any) {
      if (TI < 0) return;
      const { ctx, chartArea:{top,bottom,left,right}, scales:{x} } = c;
      const px = x.getPixelForValue(TI);
      if (px < left || px > right) return;
      ctx.save(); ctx.strokeStyle = goldAt(.8); ctx.lineWidth = 1.5; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(px,top); ctx.lineTo(px,bottom); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = goldAt(.95); ctx.font = `600 10px ${F}`;
      ctx.textAlign = "center"; ctx.fillText("today", px, top-5); ctx.restore();
    }};

    const bgP = { id:"bg", beforeDraw(c: any) {
      const { ctx, chartArea:{left,right,top,bottom}, scales:{x} } = c;
      const block = (si: number, ei: number, col: string) => {
        if (si<0||ei<0) return;
        const x1 = Math.max(left, x.getPixelForValue(si-.5)), x2 = Math.min(right, x.getPixelForValue(ei+.5));
        if (x2>x1) { ctx.fillStyle=col; ctx.fillRect(x1,top,x2-x1,bottom-top); }
      };
      RAM_BLOCKS.forEach(([si,ei]) => block(si,ei,"rgba(29,158,117,.09)"));
      BRK_BLOCKS.forEach(([si,ei]) => block(si,ei,"rgba(186,117,23,.10)"));
      const lbl = [
        { blocks:RAM_BLOCKS, labels:["Ramadan '26","Ramadan '27","Ramadan '28"] },
        { blocks:BRK_BLOCKS, labels:["Fall Break","Thanksgiving","Winter","Spring"] },
      ];
      ctx.save(); ctx.font = `10px ${F}`; ctx.fillStyle = "rgba(17,35,60,.2)"; ctx.textAlign = "center";
      lbl.forEach(({ blocks, labels }) => blocks.forEach(([si,ei], i) => {
        if (si<0||ei<0) return;
        const px = x.getPixelForValue((si+ei)/2);
        if (px>left && px<right) ctx.fillText(labels[i]||"", px, top+12);
      }));
      ctx.restore();
    }};

    const dotP = { id:"dot", afterDatasetsDraw(c: any) {
      if (aIdx === -1) return;
      const { ctx, chartArea:{top,bottom}, scales:{x,y} } = c;
      c.data.datasets.forEach((ds: any) => {
        if (ds.hidden) return; const val = ds.data[aIdx]; if (val == null) return;
        const px = x.getPixelForValue(aIdx), py = y.getPixelForValue(val);
        if (py<top-1 || py>bottom+1) return;
        ctx.save(); ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2);
        ctx.fillStyle = ds.borderColor; ctx.fill(); ctx.strokeStyle="#F5F0E6"; ctx.lineWidth=2; ctx.stroke(); ctx.restore();
      });
    }};

    const monthLabPlug = { id:"ml", afterDraw(c: any) {
      if (c.canvas.id !== "cbot") return;
      const { ctx, chartArea:{left,right,bottom}, scales:{x} } = c;
      ctx.save(); ctx.font = `11px ${F}`; ctx.textAlign="center"; ctx.textBaseline="top";
      allDays.forEach((d, i) => {
        if (d.d !== 1) return;
        const px = x.getPixelForValue(i);
        if (px < left-1 || px > right+1) return;
        ctx.fillStyle = d.mo===1 ? "rgba(17,35,60,.55)" : "rgba(17,35,60,.35)";
        ctx.fillText(d.mo===1 ? `Jan '${String(d.yr).slice(2)}` : MNS[d.mo-1], px, bottom+6);
        ctx.fillStyle = "rgba(17,35,60,.12)"; ctx.fillRect(px-.5, bottom, 1, 3);
      });
      ctx.restore();
    }};

    function isRam(mo: number, d: number, yr: number) {
      return RAM_BLOCKS.some(([si,ei]) => {
        const a=allDays[si], b=allDays[ei]; if(!a||!b) return false;
        const dt=new Date(yr,mo-1,d);
        return dt>=new Date(a.yr,a.mo-1,a.d) && dt<=new Date(b.yr,b.mo-1,b.d);
      });
    }
    function getBrk(mo: number, d: number, yr: number) {
      for (const [si,ei] of BRK_BLOCKS) {
        const a=allDays[si], b=allDays[ei]; if(!a||!b) continue;
        const dt=new Date(yr,mo-1,d);
        if (dt>=new Date(a.yr,a.mo-1,a.d) && dt<=new Date(b.yr,b.mo-1,b.d)) {
          if (mo===10||mo===9) return "Fall Break"; if (mo===11) return "Thanksgiving";
          if (mo===12||mo===1) return "Winter Recess"; if (mo===2||mo===3) return "Spring Recess";
        }
      }
      return null;
    }

    function handleTip(ctx: any) {
      const tip = document.getElementById("ctip"); if (!tip) return;
      if (dragging || ctx.tooltip.opacity === 0) {
        tip.style.display = "none";
        if (!dragging && aIdx !== TI) { aIdx=TI; topCh?.update("none"); botCh?.update("none"); }
        return;
      }
      const idx = ctx.tooltip.dataPoints[0].dataIndex;
      if (idx !== aIdx) { aIdx=idx; topCh?.update("none"); botCh?.update("none"); }
      const x = allDays[idx], ram=isRam(x.mo,x.d,x.yr), brk=getBrk(x.mo,x.d,x.yr);
      let h = `<strong style="font-size:.82rem;font-weight:600;display:block;margin-bottom:4px">${x.lbl} ${x.yr}</strong>`;
      if (ram) h += `<span style="font-size:.62rem;padding:1px 6px;border-radius:8px;font-weight:500;margin-bottom:4px;display:inline-block;background:#073d30;color:#5dcaa5">Ramadan</span><br>`;
      else if (brk) h += `<span style="font-size:.62rem;padding:1px 6px;border-radius:8px;font-weight:500;margin-bottom:4px;display:inline-block;background:#3d2e00;color:#fac775">${brk}</span><br>`;
      PC.forEach((p,i) => {
        if (!vis[i]) return;
        h += `<div style="display:flex;justify-content:space-between;gap:12px;line-height:1.8">
          <span style="display:flex;align-items:center;gap:4px;opacity:.55">
            <span style="width:8px;height:8px;border-radius:2px;background:${p.c};display:inline-block;margin-right:3px"></span>${p.n}
          </span><span style="font-weight:500">${fm((x as any)[p.k])}</span></div>`;
      });
      tip.innerHTML = h; tip.style.display = "block";
      const wr = document.getElementById("cwrap")!.getBoundingClientRect();
      const cr = ctx.chart.canvas.getBoundingClientRect();
      const rt=cr.top-wr.top, cx=ctx.tooltip.caretX, cw=ctx.chart.width;
      const tw=tip.offsetWidth||155, th=tip.offsetHeight||170;
      tip.style.left = (cx > cw*.65 ? cx-tw-10 : cx+10) + "px";
      tip.style.top = Math.max(0, rt+ctx.tooltip.caretY-th/2) + "px";
    }

    const { min:iMin, max:iMax } = getWin();
    const labels = allDays.map(x => x.lbl);
    const xCfg = { min:iMin, max:iMax, ticks:{display:false}, grid:{display:false} };
    const mkDs = (lbl: string, data: any[], col: string) => ({
      label:lbl, data:[...data], borderColor:col, borderWidth:2.2, pointRadius:0, pointHoverRadius:0, tension:.1
    });

    topCh = new Chart(document.getElementById("ctop"), {
      type:"line",
      data:{ labels, datasets:[mkDs("Fajr",allDays.map(x=>x.Fajr),"#EF7C1A"), mkDs("Shuruq",allDays.map(x=>x.Sunrise),"#EFC11A")] },
      options:{ responsive:true, maintainAspectRatio:false, interaction:{mode:"index",intersect:false},
        plugins:{ legend:{display:false}, tooltip:{enabled:false, external:handleTip} },
        scales:{ x:xCfg, y:{ reverse:true, min:3*60, max:9*60, grid:{color:G},
          ticks:{ color:TK, font:{size:11,family:F}, stepSize:30,
            callback:(v: any) => { const h=Math.floor(v/60),m=v%60; return h+":"+(m===0?"00":"30")+"am"; } }}}},
      plugins:[bgP,dotP,todayPlug,monthLabPlug]
    });
    botCh = new Chart(document.getElementById("cbot"), {
      type:"line",
      data:{ labels, datasets:[mkDs("Dhuhr",allDays.map(x=>x.Dhuhr),"#97C459"), mkDs("Asr",allDays.map(x=>x.Asr),"#3B6D11"), mkDs("Maghrib",allDays.map(x=>x.Maghrib),"#378ADD"), mkDs("Isha",allDays.map(x=>x.Isha),"#7F77DD")] },
      options:{ responsive:true, maintainAspectRatio:false, interaction:{mode:"index",intersect:false},
        layout:{ padding:{bottom:28} },
        plugins:{ legend:{display:false}, tooltip:{enabled:false, external:handleTip} },
        scales:{ x:xCfg, y:{ reverse:true, min:11*60, max:23*60, grid:{color:G},
          ticks:{ color:TK, font:{size:11,family:F}, stepSize:60,
            callback:(v: any) => { const h=Math.floor(v/60)%24, hh=h>12?h-12:h===0?12:h; return hh+(h<12?"am":"pm"); } }}}},
      plugins:[bgP,dotP,todayPlug,monthLabPlug]
    });

    aIdx = TI;

    const tc = document.getElementById("togs");
    if (tc) PC.forEach((p,i) => {
      const b = document.createElement("div");
      b.className = "pt-tog"; b.setAttribute("data-on","true");
      b.innerHTML = `<span class="pt-tog-sw" style="background:${p.c}"></span>${p.n}`;
      b.onclick = () => {
        vis[i] = !vis[i];
        const ch = p.p===0 ? topCh : botCh;
        ch.data.datasets[p.p===0?i:i-2].hidden = !vis[i];
        b.setAttribute("data-on", vis[i]?"true":"false");
        ch.update();
      };
      tc.appendChild(b);
    });

    updateLabel();

    const mmCanvas = document.getElementById("minimap") as HTMLCanvasElement;
    const mmCtx = mmCanvas?.getContext("2d");

    function drawMinimap() {
      if (!mmCanvas || !mmCtx) return;
      const W = mmCanvas.offsetWidth || mmCanvas.parentElement!.offsetWidth;
      const dpr = window.devicePixelRatio || 1;
      if (mmCanvas.width !== Math.round(W*dpr)) mmCanvas.width = Math.round(W*dpr);
      if (mmCanvas.height !== Math.round(36*dpr)) mmCanvas.height = Math.round(36*dpr);
      mmCanvas.style.width = "100%";
      mmCanvas.style.height = "36px";
      const ctx = mmCtx, N = allDays.length, H = 36*dpr;
      ctx.clearRect(0,0,W*dpr,H);
      ctx.fillStyle = "rgba(17,35,60,.06)";
      ctx.beginPath(); (ctx as any).roundRect(0,6*dpr,W*dpr,20*dpr,4*dpr); ctx.fill();
      RAM_BLOCKS.forEach(([si,ei]) => { if(si<0||ei<0)return; const x1=si/N*W*dpr,x2=ei/N*W*dpr; ctx.fillStyle="rgba(29,158,117,.18)"; ctx.fillRect(x1,6*dpr,x2-x1,20*dpr); });
      BRK_BLOCKS.forEach(([si,ei]) => { if(si<0||ei<0)return; const x1=si/N*W*dpr,x2=ei/N*W*dpr; ctx.fillStyle="rgba(186,117,23,.18)"; ctx.fillRect(x1,6*dpr,x2-x1,20*dpr); });
      clamp();
      const wx1=winStart/N*W*dpr, wx2=(winStart+curSpan)/N*W*dpr;
      ctx.fillStyle="rgba(17,35,60,.15)"; ctx.beginPath(); (ctx as any).roundRect(wx1,4*dpr,wx2-wx1,24*dpr,3*dpr); ctx.fill();
      ctx.strokeStyle="rgba(17,35,60,.3)"; ctx.lineWidth=1*dpr; ctx.beginPath(); (ctx as any).roundRect(wx1,4*dpr,wx2-wx1,24*dpr,3*dpr); ctx.stroke();
      if (TI>=0) { const tx=TI/N*W*dpr; ctx.strokeStyle=goldAt(.8); ctx.lineWidth=1.5*dpr; ctx.beginPath(); ctx.moveTo(tx,4*dpr); ctx.lineTo(tx,28*dpr); ctx.stroke(); }
      ctx.fillStyle="rgba(17,35,60,.35)"; ctx.font=`${9*dpr}px ${F}`; ctx.textAlign="center"; ctx.textBaseline="bottom";
      [2026,2027,2028].forEach(yr => {
        const idx = allDays.findIndex(d=>d.yr===yr&&d.mo===1&&d.d===1); if(idx<0)return;
        const px=idx/N*W*dpr; ctx.fillText(String(yr),px,35*dpr);
        ctx.fillStyle="rgba(17,35,60,.1)"; ctx.fillRect(px-.5*dpr,4*dpr,1*dpr,20*dpr); ctx.fillStyle="rgba(17,35,60,.35)";
      });
    }
    function mmPosToWin(cx: number) {
      const rect = mmCanvas.getBoundingClientRect();
      const frac = (cx-rect.left)/rect.width;
      return Math.max(0, Math.min(allDays.length-1-curSpan, frac*allDays.length-curSpan/2));
    }
    if (mmCanvas) {
      mmCanvas.addEventListener("mousedown", e => { winStart=mmPosToWin(e.clientX); applyWin(); });
      mmCanvas.addEventListener("touchstart", e => { winStart=mmPosToWin(e.touches[0].clientX); applyWin(); }, {passive:true});
      mmCanvas.addEventListener("wheel", e => {
        e.preventDefault();
        const delta = e.deltaY>0 ? 60 : -60;
        curSpan = Math.max(28, Math.min(allDays.length-1, curSpan+delta));
        if (TI>=0) winStart = Math.max(0, TI-Math.round(curSpan/8));
        applyWin();
      }, {passive:false});
    }

    const wrap = document.getElementById("cwrap");
    if (wrap) {
      wrap.style.cursor = "grab";
      function getPPI() { const {left,right}=topCh.chartArea,{min,max}=topCh.scales.x; return(right-left)/(max-min); }
      function startDrag(cx: number) { dragging=true; dragClientX=cx; dragWinStart=winStart; wrap!.style.cursor="grabbing"; (document.getElementById("ctip") as any).style.display="none"; }
      function moveDrag(cx: number) {
        if(!dragging||!topCh)return;
        const ppi=getPPI();
        winStart=Math.max(0,Math.min(allDays.length-1-curSpan, dragWinStart-(cx-dragClientX)/ppi));
        if(rafId)cancelAnimationFrame(rafId);
        rafId=requestAnimationFrame(()=>{applyWin(true);rafId=null;});
      }
      function endDrag() { if(!dragging)return; dragging=false; wrap!.style.cursor="grab"; aIdx=TI; topCh?.update("none"); botCh?.update("none"); }
      wrap.addEventListener("mousedown", e => { if(e.button===0) startDrag(e.clientX); });
      window.addEventListener("mousemove", e => moveDrag(e.clientX), { signal });
      window.addEventListener("mouseup", endDrag, { signal });
      wrap.addEventListener("touchstart", e => startDrag(e.touches[0].clientX), {passive:true});
      wrap.addEventListener("touchmove", e => { e.preventDefault(); moveDrag(e.touches[0].clientX); }, {passive:false});
      wrap.addEventListener("touchend", endDrag);
      wrap.addEventListener("mouseleave", () => { if(!dragging){aIdx=TI;topCh?.update("none");botCh?.update("none");(document.getElementById("ctip") as any).style.display="none";} });
      let wRaf: number|null=null, wAccX=0, wAccY=0;
      wrap.addEventListener("wheel", e => {
        e.preventDefault();
        const sc=e.deltaMode===1?20:e.deltaMode===2?300:1;
        wAccX+=e.deltaX*sc; wAccY+=e.deltaY*sc;
        if(wRaf)return;
        wRaf=requestAnimationFrame(()=>{
          const ppi=getPPI(), useX=Math.abs(wAccX)>=Math.abs(wAccY);
          const days=useX ? wAccX/ppi : -wAccY/ppi*0.8;
          winStart=Math.max(0,Math.min(allDays.length-1-curSpan,winStart+days));
          wAccX=0;wAccY=0;wRaf=null; applyWin(true);
        });
      }, {passive:false});
    }

    const todayBtn = document.getElementById("today-btn");
    if (todayBtn) todayBtn.onclick = () => { winStart=Math.max(0,TI>=0?TI-7:0); applyWin(); };

    const appDl = document.getElementById("app-dl");
    if (appDl) appDl.onclick = () => {
      const ua = navigator.userAgent.toLowerCase();
      const url = /iphone|ipad|ipod/.test(ua) ? "https://apps.apple.com/us/app/athan-pro-prayer-times-quran/id1118717500"
        : /android/.test(ua) ? "https://play.google.com/store/apps/details?id=com.batoulapps.adhan"
        : "https://mymasjidal.com/pages/athanplus";
      window.open(url, "_blank");
    };

    if (mmCanvas?.parentElement) {
      const observer = new ResizeObserver(() => drawMinimap());
      observer.observe(mmCanvas.parentElement);
      signal.addEventListener("abort", () => observer.disconnect(), { once: true });
    }
    applyWin();
  }

  const chart = <motion.div key={`${west}-${date.year}-${date.month}-${date.day}`} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="prayer-almanac">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-1"><TextField id="Prayer_10" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_12"]}>Prayer Timing Trends</TextField></p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground" id="card-title">{west?"Attawheed Islamic Center":"Islamic Center of Pittsburgh"}</h2>
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="prayer-chart-location">
                  <label htmlFor="almanac-location">Almanac location</label>
                  <select id="almanac-location" value={west ? "west" : "oakland"} onChange={event => setWest(event.target.value === "west")}>
                    <option value="oakland">{locationLabels[0]} · {locationLabels[1]}</option>
                    <option value="west">{locationLabels[2]} · {locationLabels[3]}</option>
                  </select>
                </div>
              <button id="today-btn" style={{background:"transparent",border:".5px solid var(--gold-muted)",borderRadius:"9px",padding:".28rem .65rem",cursor:"pointer",fontSize:".82rem",color:"var(--gold-text)",fontWeight:500,fontFamily:"var(--font-body)"}}><TextField id="Prayer_11" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_13"]}>↩ Today</TextField></button>
              </div>
            </div>

            <div id="togs" style={{display:"flex",flexWrap:"wrap",gap:".35rem",marginBottom:".55rem"}}></div>

            <div style={{display:"flex",flexWrap:"wrap",gap:".6rem",marginBottom:".65rem",fontFamily:"var(--font-body)",fontSize:".7rem",color:"hsl(var(--muted-foreground))"}}>
              <span style={{display:"flex",alignItems:"center",gap:"5px"}}><span style={{width:"11px",height:"9px",borderRadius:"2px",background:"rgba(29,158,117,.28)",flexShrink:0,display:"inline-block"}}></span><TextField id="Prayer_12" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_14"]}>Ramadan</TextField></span>
              <span style={{display:"flex",alignItems:"center",gap:"5px"}}><span style={{width:"11px",height:"9px",borderRadius:"2px",background:"rgba(186,117,23,.22)",flexShrink:0,display:"inline-block"}}></span><TextField id="Prayer_13" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_15"]}>Pitt breaks</TextField></span>
              <span style={{display:"flex",alignItems:"center",gap:"5px"}}><span style={{width:"11px",height:"9px",borderRadius:"2px",border:"1.5px dashed var(--gold-muted)",flexShrink:0,display:"inline-block"}}></span><TextField id="Prayer_14" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_16"]}>Today</TextField></span>
            </div>

            <div style={{position:"relative"}} id="cwrap">
              <div id="ctip"></div>
              <p style={{fontSize:".68rem",fontWeight:500,color:"hsl(var(--muted-foreground))",marginBottom:"3px",opacity:.65,fontFamily:"var(--font-body)"}}><TextField id="Prayer_15" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_17"]}>early morning</TextField></p>
              <div style={{position:"relative",width:"100%",height:"160px"}}><canvas id="ctop" role="img" aria-label="Fajr and Shuruq times"></canvas></div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",margin:"7px 0"}}>
                <div style={{flex:1,height:"1px",background:"hsl(var(--border))"}}></div>
                <span style={{fontSize:".65rem",color:"hsl(var(--muted-foreground))",opacity:.55,padding:"0 6px",whiteSpace:"nowrap",fontFamily:"var(--font-body)"}}><TextField id="Prayer_16" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_18"]}>afternoon · evening · night</TextField></span>
                <div style={{flex:1,height:"1px",background:"hsl(var(--border))"}}></div>
              </div>
              <div style={{position:"relative",width:"100%",height:"300px"}}><canvas id="cbot" role="img" aria-label="Dhuhr, Asr, Maghrib, Isha times"></canvas></div>
            </div>

            <div className="minimap-wrap"><canvas id="minimap" height="36"></canvas></div>

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:".9rem",flexWrap:"wrap",gap:".5rem"}}>
              <span>Chart uses locally calculated prayer times.</span>
              <span id="range-label" style={{fontSize:".72rem",color:"hsl(var(--muted-foreground))",fontFamily:"var(--font-body)"}}></span>
              <div style={{display:"flex",alignItems:"center",gap:".75rem",flexWrap:"wrap"}}>
                <button className="app-btn" id="app-dl"><TextField id="Prayer_17" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_19"]}>⬇ Download Athan+</TextField></button>
                <a id="src-link" href={"https://masjidal.com/widget/monthly/v2/?masjid_id="+(west?"zKz8QzAO":"QKMnW1LB")} target="_blank" rel="noopener noreferrer"
                  style={{fontSize:".7rem",color:"hsl(var(--muted-foreground))",textDecoration:"none",display:"flex",alignItems:"center",gap:"3px",fontFamily:"var(--font-body)",transition:"color .14s"}}><TextField id="Prayer_18" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_20"]}>
                  View mosque timetable via Masjidal ↗
                </TextField></a>
              </div>
            </div>
          </motion.div>;

  return <>
      <style>{`
        .pt-tog{display:flex;align-items:center;gap:5px;font-size:.7rem;cursor:pointer;padding:2px 9px;border:.5px solid hsl(var(--border));border-radius:8px;user-select:none;transition:opacity .14s;color:hsl(var(--foreground));font-family:var(--font-body)}
        .pt-tog[data-on="false"]{opacity:.3}
        .pt-tog-sw{width:9px;height:9px;border-radius:2px;flex-shrink:0}
        #ctip{position:absolute;background:hsl(var(--card)/.97);border:.5px solid hsl(var(--border));border-radius:12px;padding:9px 12px;font-size:.75rem;font-family:var(--font-body);pointer-events:none;display:none;z-index:20;min-width:155px;color:hsl(var(--foreground));box-shadow:0 6px 24px rgba(17,35,60,.09)}
        .app-btn{background:hsl(var(--accent));color:white;border:none;border-radius:9px;padding:.32rem .75rem;font-size:.72rem;font-weight:500;cursor:pointer;font-family:var(--font-body);transition:background .14s}
        .app-btn:hover{opacity:.85}
        #cwrap{user-select:none;-webkit-user-select:none}
        .minimap-wrap{margin-top:.75rem;cursor:pointer}
        #minimap{width:100%;display:block;border-radius:6px}
      `}</style>
    {chart}
  </>;
}
