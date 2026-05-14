import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, Building2, Landmark, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import SectionDivider from "@/components/SectionDivider";
import SectionHeading from "@/components/SectionHeading";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";

declare global { interface Window { Chart: any; } }

// ─── Solar prayer time calculator ────────────────────────────────────────────
const DEG = Math.PI / 180;
function julianDate(y: number, m: number, d: number) {
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  return Math.floor(365.25*(y+4716)) + Math.floor(30.6001*(m+1)) + d + (2-A+Math.floor(A/4)) - 1524.5;
}
function easternTZ(y: number, m: number, d: number) {
  const nthSun = (yr: number, mo: number, n: number) => {
    const fd = new Date(yr, mo-1, 1).getDay();
    return (fd === 0 ? 1 : 8 - fd) + (n-1)*7;
  };
  const dt = new Date(y, m-1, d);
  return (dt >= new Date(y, 2, nthSun(y,3,2)) && dt < new Date(y, 10, nthSun(y,11,1))) ? -4 : -5;
}
function calcDay(lat: number, lng: number, y: number, m: number, d: number) {
  const tz = easternTZ(y, m, d);
  const D = julianDate(y, m, d) - 2451545.0;
  const g = ((357.529 + 0.98560028*D) % 360 + 360) % 360;
  const q = ((280.459 + 0.98564736*D) % 360 + 360) % 360;
  const L = ((q + 1.915*Math.sin(g*DEG) + 0.020*Math.sin(2*g*DEG)) % 360 + 360) % 360;
  const e = 23.439 - 0.00000036*D;
  const RA = Math.atan2(Math.cos(e*DEG)*Math.sin(L*DEG), Math.cos(L*DEG)) / DEG / 15;
  const dec = Math.asin(Math.sin(e*DEG)*Math.sin(L*DEG)) / DEG;
  let EqT = q/15 - RA; EqT = EqT - Math.round(EqT/24)*24;
  const noon = 12 - lng/15 - EqT + tz;
  const HA = (ang: number) => {
    const c = (Math.sin(ang*DEG) - Math.sin(lat*DEG)*Math.sin(dec*DEG)) / (Math.cos(lat*DEG)*Math.cos(dec*DEG));
    return Math.abs(c) > 1 ? null : Math.acos(c) / DEG / 15;
  };
  const Hs = HA(-0.8333), Hf = HA(-15);
  const elevA = Math.atan(1 / (1 + Math.tan(Math.abs(lat - dec)*DEG))) / DEG;
  const Ha = HA(elevA);
  const fl = (v: number) => Math.floor(v*60);
  const rnd = (v: number) => Math.round(v*60);
  return {
    Fajr:    Hf != null ? fl(noon - Hf)    : null,
    Sunrise: Hs != null ? fl(noon - Hs)    : null,
    Dhuhr:   rnd(noon),
    Asr:     Ha != null ? rnd(noon + Ha)   : null,
    Maghrib: Hs != null ? rnd(noon + Hs + 1/60) : null,
    Isha:    Hf != null ? rnd(noon + Hf + 1/60) : null,
  };
}

const MN = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
const MNS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
type DayEntry = { yr: number; mo: number; d: number; lbl: string;
  Fajr: number|null; Sunrise: number|null; Dhuhr: number|null;
  Asr: number|null; Maghrib: number|null; Isha: number|null; };

const ICP_LAT = 40.4490, ICP_LNG = -79.9619;
const ATT_LAT = 40.4065, ATT_LNG = -80.0839;

function buildDays(lat: number, lng: number): DayEntry[] {
  const days: DayEntry[] = [];
  for (let y = 2026; y <= 2028; y++)
    for (let m = 1; m <= 12; m++)
      for (let d = 1, dim = new Date(y, m, 0).getDate(); d <= dim; d++)
        days.push({ yr: y, mo: m, d, lbl: `${MNS[m-1]} ${d}`, ...calcDay(lat, lng, y, m, d) });
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

function fm(x: number|null) {
  if (x == null) return "—";
  const h = Math.floor(x/60) % 24, m = Math.round(x % 60);
  const ap = h < 12 ? "am" : "pm", hh = h === 0 ? 12 : h > 12 ? h-12 : h;
  return `${hh}:${m < 10 ? "0"+m : m}${ap}`;
}

// ─── Location data ────────────────────────────────────────────────────────────
const onCampus = [
  {
    name: "WPU Reflection Room",
    detail: "3rd floor of the William Pitt Union",
    features: [
      "Prayer mats and prayer attire (thobes, abayas, hijabs) provided.",
      "Ablution stations in both the men's and women's restrooms on the same floor.",
      "2 private bathrooms + showers on this floor.",
      "This is the main spot for daily prayers.",
    ],
  },
  {
    name: "Rec Center Reflection Room",
    detail: "8th floor, past the bathrooms and behind the double doors",
    features: [
      "Sometimes locked — you may need to ask staff to unlock it.",
      "Private bathrooms with wudu stations adjacent.",
    ],
  },
  {
    name: "Benedum Room 403",
    detail: "Engineering building",
    features: [
      "Equipped with a sink that can be used for wudu.",
      "Can lock from the inside for privacy.",
    ],
  },
  {
    name: "School of Public Health — Room A721",
    detail: "Floor 7, all the way down the hallway from the elevators and to the left",
    features: ["Has a seat and prayer mat."],
  },
];

const masajid = [
  {
    name: "Islamic Center of Pittsburgh (ICP)",
    distance: "~10 minute walk from campus",
    details: [
      "Two Jumu'ah services every Friday (~30 min each):",
      "Arabic Khutba at 12:15 PM",
      "English Jumu'ah at 1:15 PM",
      "MSA supplements these with on-campus Jummah at 2 PM — typically at O'Hara. Check Instagram and WhatsApp for updates.",
    ],
  },
  {
    name: "Attawheed Islamic Center (AIC)",
    distance: "About 5 miles west",
    details: [
      "Two Jumu'ah services: 12:00 PM and 1:10 PM",
      "Founded by Pitt and CMU grad students in 1995.",
      "Several halal restaurants nearby including Afghan Kabab House, Raya's Pizza, Saba, and Rahma Market.",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Prayer = () => {
  const [todayHtml, setTodayHtml] = useState<string>("loading...");
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const existingScript = document.getElementById("chartjs-cdn");
    if (existingScript) { boot(); return; }
    const s = document.createElement("script");
    s.id = "chartjs-cdn";
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = () => boot();
    document.head.appendChild(s);

    return () => {
      ["ctop","cbot"].forEach(id => {
        const el = document.getElementById(id) as HTMLCanvasElement;
        if (el) window.Chart?.getChart?.(el)?.destroy();
      });
    };
  }, []);

  function boot() {
    const Chart = window.Chart;
    if (!Chart) return;

    let allDays = buildDays(ICP_LAT, ICP_LNG);
    let { RAM: RAM_BLOCKS, BRK: BRK_BLOCKS } = buildZones(allDays);
    const apiCache: Record<string,boolean> = {};
    const now = new Date(), CY = now.getFullYear(), CM = now.getMonth()+1, CD = now.getDate();
    let TI = allDays.findIndex(x => x.yr === CY && x.mo === CM && x.d === CD);
    const SPANS: Record<string,number> = { "1mo":35, "6mo":182, "year":365 };
    let curSpan = SPANS["year"];
    let winStart = Math.max(0, TI >= 0 ? TI - 7 : 0);
    let topCh: any = null, botCh: any = null;
    let aIdx = TI;
    let vis = [true,true,true,true,true,true];
    let dragging = false, dragClientX = 0, dragWinStart = 0, rafId: number|null = null;
    let currentLat = ICP_LAT, currentLng = ICP_LNG;

    function renderTodayBar() {
      if (TI < 0) { setTodayHtml('<span style="font-size:.7rem;color:rgba(17,35,60,.5)">No data for today</span>'); return; }
      const T = allDays[TI];
      const dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(T.yr, T.mo-1, T.d).getDay()];
      let h = `<span style="font-size:.7rem;font-weight:600;color:#C9A84C;text-transform:uppercase;letter-spacing:.1em;margin-right:.4rem;white-space:nowrap">${dow}, ${MNS[T.mo-1]} ${T.d}</span>`;
      PC.forEach(p => {
        h += `<span style="display:flex;align-items:center;gap:.25rem;font-size:.75rem">
          <span style="opacity:.5;font-size:.68rem;color:${p.c}">${p.n}</span>
          <span style="font-weight:500">${fm((T as any)[p.k])}</span>
        </span>`;
      });
      setTodayHtml(h);
    }
    renderTodayBar();

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
    function refreshCharts() {
      if (!topCh || !botCh) return;
      topCh.data.datasets[0].data = allDays.map(x => x.Fajr);
      topCh.data.datasets[1].data = allDays.map(x => x.Sunrise);
      botCh.data.datasets[0].data = allDays.map(x => x.Dhuhr);
      botCh.data.datasets[1].data = allDays.map(x => x.Asr);
      botCh.data.datasets[2].data = allDays.map(x => x.Maghrib);
      botCh.data.datasets[3].data = allDays.map(x => x.Isha);
      topCh.update("none"); botCh.update("none");
    }

    async function fetchMonth(y: number, m: number) {
      const key = `${y}-${m}-${currentLat}`;
      if (apiCache[key]) return;
      try {
        const url = `https://api.aladhan.com/v1/calendar/${y}/${m}?latitude=${currentLat}&longitude=${currentLng}&method=2&school=0`;
        const res = await fetch(url);
        const j = await res.json();
        if (j.code !== 200) return;
        j.data.forEach((entry: any) => {
          const day = +entry.date.gregorian.day;
          const idx = allDays.findIndex(x => x.yr === y && x.mo === m && x.d === day);
          if (idx < 0) return;
          const pt = entry.timings;
          const parseT = (s: string) => { const [h,mi] = s.split(' ')[0].split(':').map(Number); return h*60+mi; };
          allDays[idx] = { ...allDays[idx], Fajr:parseT(pt.Fajr), Sunrise:parseT(pt.Sunrise), Dhuhr:parseT(pt.Dhuhr), Asr:parseT(pt.Asr), Maghrib:parseT(pt.Maghrib), Isha:parseT(pt.Isha) };
        });
        apiCache[key] = true;
        refreshCharts();
        if (y === CY && m === CM) renderTodayBar();
      } catch(_) {}
    }
    async function fetchAll() {
      const months: [number,number][] = [];
      for (let y = 2026; y <= 2028; y++) for (let m = 1; m <= 12; m++) months.push([y,m]);
      months.sort(([ya,ma],[yb,mb]) => Math.abs((ya-CY)*12+(ma-CM)) - Math.abs((yb-CY)*12+(mb-CM)));
      for (let i = 0; i < months.length; i += 6)
        await Promise.allSettled(months.slice(i, i+6).map(([y,m]) => fetchMonth(y,m)));
    }

    const F = "'Plus Jakarta Sans',system-ui,sans-serif";
    const G = "rgba(17,35,60,.065)", TK = "rgba(17,35,60,.38)";

    const todayPlug = { id:"tl", afterDraw(c: any) {
      if (TI < 0) return;
      const { ctx, chartArea:{top,bottom,left,right}, scales:{x} } = c;
      const px = x.getPixelForValue(TI);
      if (px < left || px > right) return;
      ctx.save(); ctx.strokeStyle = "rgba(201,168,76,.8)"; ctx.lineWidth = 1.5; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(px,top); ctx.lineTo(px,bottom); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = "rgba(201,168,76,.95)"; ctx.font = `600 10px ${F}`;
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
      mmCanvas.width = W*dpr; mmCanvas.style.width = W+"px";
      mmCanvas.height = 36*dpr; mmCanvas.style.height = "36px";
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
      if (TI>=0) { const tx=TI/N*W*dpr; ctx.strokeStyle="rgba(201,168,76,.8)"; ctx.lineWidth=1.5*dpr; ctx.beginPath(); ctx.moveTo(tx,4*dpr); ctx.lineTo(tx,28*dpr); ctx.stroke(); }
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
      window.addEventListener("mousemove", e => moveDrag(e.clientX));
      window.addEventListener("mouseup", endDrag);
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

    document.querySelectorAll<HTMLButtonElement>(".msm").forEach(b => {
      b.onclick = () => {
        document.querySelectorAll<HTMLButtonElement>(".msm").forEach(x => x.classList.remove("on"));
        b.classList.add("on");
        currentLat = parseFloat(b.dataset.lat!); currentLng = parseFloat(b.dataset.lng!);
        Object.keys(apiCache).forEach(k => delete apiCache[k]);
        allDays = buildDays(currentLat, currentLng);
        ({ RAM: RAM_BLOCKS, BRK: BRK_BLOCKS } = buildZones(allDays));
        TI = allDays.findIndex(x => x.yr===CY && x.mo===CM && x.d===CD);
        aIdx = TI;
        refreshCharts(); renderTodayBar();
        const sl = document.getElementById("src-link") as HTMLAnchorElement;
        if (sl) { sl.href=`https://masjidal.com/widget/monthly/v2/?masjid_id=${b.dataset.mid}`; sl.textContent=`Source: ${b.dataset.name} via Masjidal ↗`; }
        const ct = document.getElementById("card-title");
        if (ct) ct.textContent = b.dataset.mid==="QKMnW1LB" ? "Islamic Center of Pittsburgh" : "Attawheed Islamic Center";
        fetchAll(); drawMinimap();
      };
    });

    const appDl = document.getElementById("app-dl");
    if (appDl) appDl.onclick = () => {
      const ua = navigator.userAgent.toLowerCase();
      const url = /iphone|ipad|ipod/.test(ua) ? "https://apps.apple.com/us/app/athan-pro-prayer-times-quran/id1118717500"
        : /android/.test(ua) ? "https://play.google.com/store/apps/details?id=com.batoulapps.adhan"
        : "https://mymasjidal.com/pages/athanplus";
      window.open(url, "_blank");
    };

    if (mmCanvas?.parentElement) new ResizeObserver(() => drawMinimap()).observe(mmCanvas.parentElement!);
    setTimeout(() => { drawMinimap(); applyWin(); }, 80);
    fetchAll();
  }

  return (
    <Layout>
      <style>{`
        .pt-tog{display:flex;align-items:center;gap:5px;font-size:.7rem;cursor:pointer;padding:2px 9px;border:.5px solid hsl(var(--border));border-radius:8px;user-select:none;transition:opacity .14s;color:hsl(var(--foreground));font-family:var(--font-body)}
        .pt-tog[data-on="false"]{opacity:.3}
        .pt-tog-sw{width:9px;height:9px;border-radius:2px;flex-shrink:0}
        #ctip{position:absolute;background:hsl(var(--card)/.97);border:.5px solid hsl(var(--border));border-radius:12px;padding:9px 12px;font-size:.75rem;font-family:var(--font-body);pointer-events:none;display:none;z-index:20;min-width:155px;color:hsl(var(--foreground));box-shadow:0 6px 24px rgba(17,35,60,.09)}
        .msm{display:flex;align-items:center;gap:.55rem;padding:.55rem .9rem;border:.5px solid hsl(var(--border));border-radius:11px;cursor:pointer;background:transparent;font-family:var(--font-body);transition:all .18s;flex:1}
        .msm:hover{border-color:hsl(var(--foreground)/.28)}
        .msm.on{background:hsl(var(--accent));border-color:hsl(var(--accent))}
        .msm-dot{width:8px;height:8px;border-radius:50%;background:hsl(var(--muted-foreground));flex-shrink:0;transition:all .18s}
        .msm.on .msm-dot{background:#C9A84C}
        .msm-labels{display:flex;flex-direction:column;gap:.05rem}
        .msm-name{font-size:.82rem;font-weight:600;color:hsl(var(--foreground));transition:color .18s;line-height:1.2}
        .msm.on .msm-name{color:white}
        .msm-loc{font-size:.64rem;color:hsl(var(--muted-foreground));transition:color .18s}
        .msm.on .msm-loc{color:rgba(255,255,255,.45)}
        .app-btn{background:hsl(var(--accent));color:white;border:none;border-radius:9px;padding:.32rem .75rem;font-size:.72rem;font-weight:500;cursor:pointer;font-family:var(--font-body);transition:background .14s}
        .app-btn:hover{opacity:.85}
        #cwrap{user-select:none;-webkit-user-select:none}
        .minimap-wrap{margin-top:.75rem;cursor:pointer}
        #minimap{width:100%;display:block;border-radius:6px}
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative py-28 md:py-36 text-center px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-gold" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage:`url(${patternImg})`, backgroundSize:"200px" }} />
        <BridgeBar />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-5">
            Resources
          </motion.p>
          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4">
            Prayer at <span className="text-gradient-gold inline-block pb-1">Pitt</span>
          </motion.h1>
          <motion.p initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.2}} className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Prayer times, campus spaces, nearby masajid, and Jummah — everything in one place.
          </motion.p>
        </div>
      </section>

      {/* ── Prayer Times Chart ───────────────────────────────────── */}
      <section className="py-10 px-4 pb-14">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:.1}} className="glass-card rounded-2xl p-6">
            <div style={{display:"flex",gap:".5rem",marginBottom:"1.1rem"}}>
              <button className="msm on" data-mid="QKMnW1LB" data-lat="40.4490" data-lng="-79.9619" data-name="ICP">
                <span className="msm-dot"></span>
                <span className="msm-labels"><span className="msm-name">ICP</span><span className="msm-loc">Oakland · Pittsburgh</span></span>
              </button>
              <button className="msm" data-mid="zKz8QzAO" data-lat="40.4065" data-lng="-80.0839" data-name="Attawheed">
                <span className="msm-dot"></span>
                <span className="msm-labels"><span className="msm-name">Attawheed</span><span className="msm-loc">Carnegie · Pittsburgh</span></span>
              </button>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-primary font-semibold mb-1">Prayer Timing Trends</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground" id="card-title">Islamic Center of Pittsburgh</h2>
              </div>
              <button id="today-btn" style={{background:"transparent",border:".5px solid #C9A84C",borderRadius:"9px",padding:".28rem .65rem",cursor:"pointer",fontSize:".82rem",color:"#C9A84C",fontWeight:500,fontFamily:"var(--font-body)"}}>↩ Today</button>
            </div>

            <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:".3rem .9rem",padding:".55rem .85rem",background:"rgba(201,168,76,.07)",border:".5px solid rgba(201,168,76,.22)",borderRadius:"10px",marginBottom:".7rem",minHeight:"38px",fontFamily:"var(--font-body)"}}
              dangerouslySetInnerHTML={{__html: todayHtml}} />

            <div id="togs" style={{display:"flex",flexWrap:"wrap",gap:".35rem",marginBottom:".55rem"}}></div>

            <div style={{display:"flex",flexWrap:"wrap",gap:".6rem",marginBottom:".65rem",fontFamily:"var(--font-body)",fontSize:".7rem",color:"hsl(var(--muted-foreground))"}}>
              <span style={{display:"flex",alignItems:"center",gap:"5px"}}><span style={{width:"11px",height:"9px",borderRadius:"2px",background:"rgba(29,158,117,.28)",flexShrink:0,display:"inline-block"}}></span>Ramadan</span>
              <span style={{display:"flex",alignItems:"center",gap:"5px"}}><span style={{width:"11px",height:"9px",borderRadius:"2px",background:"rgba(186,117,23,.22)",flexShrink:0,display:"inline-block"}}></span>Pitt breaks</span>
              <span style={{display:"flex",alignItems:"center",gap:"5px"}}><span style={{width:"11px",height:"9px",borderRadius:"2px",border:"1.5px dashed #C9A84C",flexShrink:0,display:"inline-block"}}></span>Today</span>
            </div>

            <div style={{position:"relative"}} id="cwrap">
              <div id="ctip"></div>
              <p style={{fontSize:".68rem",fontWeight:500,color:"hsl(var(--muted-foreground))",marginBottom:"3px",opacity:.65,fontFamily:"var(--font-body)"}}>early morning</p>
              <div style={{position:"relative",width:"100%",height:"160px"}}><canvas id="ctop" role="img" aria-label="Fajr and Shuruq times"></canvas></div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",margin:"7px 0"}}>
                <div style={{flex:1,height:"1px",background:"hsl(var(--border))"}}></div>
                <span style={{fontSize:".65rem",color:"hsl(var(--muted-foreground))",opacity:.55,padding:"0 6px",whiteSpace:"nowrap",fontFamily:"var(--font-body)"}}>afternoon · evening · night</span>
                <div style={{flex:1,height:"1px",background:"hsl(var(--border))"}}></div>
              </div>
              <div style={{position:"relative",width:"100%",height:"300px"}}><canvas id="cbot" role="img" aria-label="Dhuhr, Asr, Maghrib, Isha times"></canvas></div>
            </div>

            <div className="minimap-wrap"><canvas id="minimap" height="36"></canvas></div>

            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:".9rem",flexWrap:"wrap",gap:".5rem"}}>
              <span id="range-label" style={{fontSize:".72rem",color:"hsl(var(--muted-foreground))",fontFamily:"var(--font-body)"}}></span>
              <div style={{display:"flex",alignItems:"center",gap:".75rem",flexWrap:"wrap"}}>
                <button className="app-btn" id="app-dl">⬇ Download Athan+</button>
                <a id="src-link" href="https://masjidal.com/widget/monthly/v2/?masjid_id=QKMnW1LB" target="_blank" rel="noopener noreferrer"
                  style={{fontSize:".7rem",color:"hsl(var(--muted-foreground))",textDecoration:"none",display:"flex",alignItems:"center",gap:"3px",fontFamily:"var(--font-body)",transition:"color .14s"}}>
                  Source: ICP via Masjidal ↗
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Jummah Prayer ────────────────────────────────────────── */}
      <section className="section-padding gradient-section-gold-soft relative overflow-hidden">
        <div className="absolute inset-0 texture-dots opacity-50 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <SectionHeading title="Jummah Prayer" label="Every Friday" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card-strong rounded-2xl p-6 md:p-8"
          >
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🕌</span>
                  </div>
                  <div>
                    <p className="font-body font-bold text-foreground text-base">Every Friday at 2:00 PM</p>
                    <p className="font-body text-muted-foreground text-sm">Typically held in Ohara Ballroom</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-xl bg-primary/[0.06] border border-primary/15 px-4 py-3">
                    <Clock size={15} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm">Prayer time: 2:00 PM sharp</p>
                      <p className="font-dm-sans text-muted-foreground text-xs mt-0.5 leading-relaxed">Arrive a few minutes early for khutbah. Location may change — always confirm before heading over.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-body font-semibold text-foreground text-sm mb-3">Confirm location each week:</p>
                <div className="space-y-2.5">
                  <a href="https://instagram.com/msa.at.pitt" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-colors px-4 py-3 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-foreground text-sm">Check Instagram Stories</p>
                      <p className="font-body text-muted-foreground text-xs">@msa.at.pitt — posted Friday mornings</p>
                    </div>
                    <ExternalLink size={13} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </a>

                  <a href="https://chat.whatsapp.com/GuWsLzCvRggF9Ua6tWrkJL" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-colors px-4 py-3 group">
                    <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center flex-shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-foreground text-sm">MSA WhatsApp Announcements</p>
                      <p className="font-body text-muted-foreground text-xs">Location confirmations & updates</p>
                    </div>
                    <ExternalLink size={13} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ── On-campus prayer spaces ──────────────────────────────── */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 steps-surface" />
        <div className="absolute inset-0 texture-dots opacity-50" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="gold-gradient w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
              <Building2 className="text-primary-foreground" size={18} />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">On-Campus Prayer Spaces</h2>
          </div>

          <div className="space-y-5">
            {onCampus.map((space, i) => (
              <motion.div
                key={space.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="liquid-glass-hover p-6 md:p-7 rounded-2xl"
              >
                <div className="flex items-start gap-3 mb-3">
                  <MapPin size={16} className="text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{space.name}</h3>
                    <p className="text-muted-foreground text-sm">{space.detail}</p>
                  </div>
                </div>
                <ul className="space-y-1.5 pl-7">
                  {space.features.map((f, j) => (
                    <li key={j} className="text-muted-foreground text-sm leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-primary/50">
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Nearby Masajid ───────────────────────────────────────── */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 warm-surface" />
        <div className="absolute inset-0 texture-cross opacity-40" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-secondary w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
              <Landmark className="text-secondary-foreground" size={18} />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Nearby Masajid</h2>
          </div>

          <div className="space-y-5">
            {masajid.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="liquid-glass-hover p-6 md:p-7 rounded-2xl"
              >
                <h3 className="font-display text-lg font-bold text-foreground mb-1">{m.name}</h3>
                <p className="text-sm text-primary font-semibold mb-3">{m.distance}</p>
                <ul className="space-y-1.5">
                  {m.details.map((d, j) => (
                    <li key={j} className="text-muted-foreground text-sm leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary/50">
                      {d}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Closing verse ────────────────────────────────────────── */}
      <section className="section-padding-sm gradient-section-emerald-soft">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-8 md:p-12">
            <ArabicVerse
              arabic="أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ"
              translation="Establish prayer from the decline of the sun to the darkness of the night."
              reference="Quran 17:78"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Prayer;
