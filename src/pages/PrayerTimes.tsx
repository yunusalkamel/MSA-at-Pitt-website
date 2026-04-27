import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import patternImg from "@/assets/islamic-pattern.jpg";

declare global {
  interface Window {
    Chart: any;
  }
}

const PrayerTimes = () => {
  const chartJsLoaded = useRef(false);

  useEffect(() => {
    if (chartJsLoaded.current) return;
    chartJsLoaded.current = true;

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = () => initCharts();
    document.head.appendChild(script);

    return () => {
      // cleanup charts on unmount
      const topCanvas = document.getElementById("ctop") as HTMLCanvasElement;
      const botCanvas = document.getElementById("cbot") as HTMLCanvasElement;
      if (topCanvas) {
        const existing = window.Chart?.getChart?.(topCanvas);
        existing?.destroy();
      }
      if (botCanvas) {
        const existing = window.Chart?.getChart?.(botCanvas);
        existing?.destroy();
      }
    };
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-28 md:py-36 text-center px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-gold" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }}
        />
        <BridgeBar />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-5"
          >
            Pittsburgh
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4"
          >
            Prayer <span className="text-gradient-gold">Times</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed"
          >
            Monthly prayer schedules and annual timing trends for the Pittsburgh area.
          </motion.p>
        </div>
      </section>

      {/* Monthly Widget — Attawheed Masjid */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className="px-6 pt-6 pb-2">
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-1">
                Source
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Attawheed Islamic Center
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Monthly iqamah schedule via Masjidal
              </p>
            </div>
            <div className="p-4">
              <iframe
                src="https://masjidal.com/widget/monthly/v2/?masjid_id=zKz8QzAO"
                title="Attawheed Islamic Center Monthly Prayer Times"
                className="w-full rounded-xl border-0"
                style={{ minHeight: "480px" }}
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Annual Chart Section */}
      <section className="py-10 px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-1">
                Annual View
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Prayer Timing Trends
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Aug 2026 – Apr 2027 · Pittsburgh, PA
              </p>
            </div>

            {/* Chart controls injected via script */}
            <div id="chart-root">
              <style>{`
                .chart-topbar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:10px}
                .chart-topbar-title{font-size:13px;font-weight:500;flex:1;min-width:180px;font-family:var(--font-body,'Plus Jakarta Sans',system-ui,sans-serif)}
                .chart-toggles{display:flex;flex-wrap:wrap;gap:5px}
                .chart-tog{display:flex;align-items:center;gap:5px;font-size:12px;cursor:pointer;padding:3px 9px;border:.5px solid rgba(255,255,255,0.11);border-radius:8px;user-select:none;transition:opacity .15s;background:transparent;font-family:var(--font-body,'Plus Jakarta Sans',system-ui,sans-serif)}
                .chart-tog.off{opacity:.3}
                .chart-sw{width:10px;height:10px;border-radius:2px;flex-shrink:0}
                .chart-legrow{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px}
                .chart-leg{display:flex;align-items:center;gap:5px;font-size:11px;font-family:var(--font-body,'Plus Jakarta Sans',system-ui,sans-serif)}
                .chart-legsq{width:12px;height:10px;border-radius:2px;flex-shrink:0}
                .chart-divlabel{font-size:11px;font-weight:500;margin-bottom:3px;opacity:0.45;font-family:var(--font-body,'Plus Jakarta Sans',system-ui,sans-serif)}
                .chart-divider{display:flex;align-items:center;gap:8px;margin:7px 0}
                .chart-divline{flex:1;height:1px;background:rgba(255,255,255,0.11)}
                .chart-divtxt{font-size:10px;opacity:0.35;white-space:nowrap;padding:0 6px;font-family:var(--font-body,'Plus Jakarta Sans',system-ui,sans-serif)}
                .chart-badge{font-size:10px;padding:1px 7px;border-radius:8px;font-weight:500;margin-bottom:5px;display:inline-block}
                .chart-badge-brk{background:#3d2e00;color:#fac775}
                .chart-badge-ram{background:#073d30;color:#5dcaa5}
                #chart-tip{
                  position:absolute;background:var(--glass-bg,rgba(245,240,230,0.9));
                  border:.5px solid rgba(0,0,0,0.12);border-radius:12px;
                  padding:9px 12px;font-size:12px;
                  font-family:var(--font-body,'Plus Jakarta Sans',system-ui,sans-serif);
                  pointer-events:none;display:none;z-index:20;min-width:162px;
                  color:hsl(var(--foreground));
                  backdrop-filter:blur(12px);
                  box-shadow:0 8px 32px rgba(0,0,0,0.1);
                }
                #chart-tip strong{font-size:13px;font-weight:600;display:block;margin-bottom:5px;}
                .chart-tr{display:flex;justify-content:space-between;gap:14px;line-height:1.8}
                .chart-lbl{display:flex;align-items:center;gap:5px;opacity:0.6}
                .chart-val{font-weight:500}
              `}</style>

              <div className="chart-topbar">
                <span className="chart-topbar-title" style={{ color: "hsl(var(--foreground))", opacity: 0.7 }}>
                  Prayer Timings in Pittsburgh
                </span>
                <div className="chart-toggles" id="togs"></div>
              </div>
              <div className="chart-legrow">
                <span className="chart-leg" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <span className="chart-legsq" style={{ background: "rgba(29,158,117,0.3)" }}></span>Ramadan
                </span>
                <span className="chart-leg" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <span className="chart-legsq" style={{ background: "rgba(186,117,23,0.25)" }}></span>Pitt breaks
                </span>
              </div>
              <div style={{ position: "relative" }} id="chart-wrap">
                <div id="chart-tip"></div>
                <div className="chart-divlabel" style={{ color: "hsl(var(--foreground))" }}>early morning</div>
                <div style={{ position: "relative", width: "100%", height: "160px" }}>
                  <canvas id="ctop" role="img" aria-label="Fajr and Shuruq times"></canvas>
                </div>
                <div className="chart-divider">
                  <div className="chart-divline"></div>
                  <span className="chart-divtxt" style={{ color: "hsl(var(--foreground))" }}>afternoon · evening · night</span>
                  <div className="chart-divline"></div>
                </div>
                <div style={{ position: "relative", width: "100%", height: "300px" }}>
                  <canvas id="cbot" role="img" aria-label="Dhuhr, Asr, Maghrib, Isha times"></canvas>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

function initCharts() {
  const Chart = window.Chart;
  if (!Chart) return;

  const PRAYERS = [
    { n: "Fajr",    c: "#EF7C1A", dash: [],         pm: false, panel: 0 },
    { n: "Shuruq",  c: "#EFC11A", dash: [4, 3],      pm: false, panel: 0 },
    { n: "Dhuhr",   c: "#97C459", dash: [8, 3],       pm: true,  panel: 1 },
    { n: "Asr",     c: "#3B6D11", dash: [4, 3, 1, 3], pm: true,  panel: 1 },
    { n: "Maghrib", c: "#378ADD", dash: [],            pm: true,  panel: 1 },
    { n: "Isha",    c: "#7F77DD", dash: [5, 3],        pm: true,  panel: 1 },
  ];

  const vis = [true, true, true, true, true, true];
  let activeIdx = -1;
  let topChart: any, botChart: any;

  function toM(t: string, pm: boolean) {
    const [h, m] = t.split(":").map(Number);
    if (pm && h < 12) return (h + 12) * 60 + m;
    return h * 60 + m;
  }
  function fmt(mins: number) {
    const h = Math.floor(mins / 60) % 24, m = Math.round(mins % 60);
    const ap = h < 12 ? "am" : "pm", hh = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return hh + ":" + (m < 10 ? "0" + m : m) + ap;
  }
  function isRam(mo: number, d: number) { return (mo === 2 && d >= 8) || (mo === 3 && d <= 8); }
  function getBrk(mo: number, d: number) {
    if (mo === 10 && d >= 9 && d <= 11) return "Fall Break";
    if (mo === 11 && d >= 22 && d <= 29) return "Thanksgiving";
    if (mo === 12 && d >= 13) return "Winter Recess";
    if (mo === 1 && d <= 10) return "Winter Recess";
    if (mo === 3 && d >= 7 && d <= 13) return "Spring Recess";
    return null;
  }

  const raw: any[] = [
    ["Aug 1",8,1,"4:50","6:18","1:27","5:21","8:35","10:03"],["Aug 2",8,2,"4:51","6:19","1:27","5:20","8:34","10:02"],["Aug 3",8,3,"4:52","6:20","1:27","5:20","8:33","10:00"],["Aug 4",8,4,"4:54","6:21","1:26","5:20","8:32","9:59"],["Aug 5",8,5,"4:55","6:22","1:26","5:19","8:30","9:57"],["Aug 6",8,6,"4:56","6:23","1:26","5:19","8:29","9:55"],["Aug 7",8,7,"4:58","6:24","1:26","5:18","8:28","9:54"],["Aug 8",8,8,"4:59","6:25","1:26","5:18","8:27","9:52"],["Aug 9",8,9,"5:00","6:26","1:26","5:17","8:26","9:51"],["Aug 10",8,10,"5:01","6:26","1:26","5:17","8:24","9:49"],["Aug 11",8,11,"5:03","6:27","1:26","5:16","8:23","9:47"],["Aug 12",8,12,"5:04","6:28","1:25","5:16","8:22","9:46"],["Aug 13",8,13,"5:05","6:29","1:25","5:15","8:20","9:44"],["Aug 14",8,14,"5:07","6:30","1:25","5:15","8:19","9:42"],["Aug 15",8,15,"5:08","6:31","1:25","5:14","8:18","9:41"],["Aug 16",8,16,"5:09","6:32","1:25","5:13","8:16","9:39"],["Aug 17",8,17,"5:11","6:33","1:24","5:13","8:15","9:37"],["Aug 18",8,18,"5:12","6:34","1:24","5:12","8:13","9:36"],["Aug 19",8,19,"5:13","6:35","1:24","5:11","8:12","9:34"],["Aug 20",8,20,"5:14","6:36","1:24","5:11","8:11","9:32"],["Aug 21",8,21,"5:16","6:37","1:23","5:10","8:09","9:30"],["Aug 22",8,22,"5:17","6:38","1:23","5:09","8:08","9:29"],["Aug 23",8,23,"5:18","6:39","1:23","5:08","8:06","9:27"],["Aug 24",8,24,"5:20","6:40","1:23","5:08","8:05","9:25"],["Aug 25",8,25,"5:21","6:41","1:22","5:07","8:03","9:23"],["Aug 26",8,26,"5:22","6:42","1:22","5:06","8:02","9:21"],["Aug 27",8,27,"5:23","6:43","1:22","5:05","8:00","9:20"],["Aug 28",8,28,"5:24","6:44","1:22","5:04","7:58","9:18"],["Aug 29",8,29,"5:26","6:45","1:21","5:03","7:57","9:16"],["Aug 30",8,30,"5:27","6:46","1:21","5:03","7:55","9:14"],["Aug 31",8,31,"5:28","6:47","1:21","5:02","7:54","9:12"],
    ["Sep 1",9,1,"5:29","6:48","1:20","5:01","7:52","9:10"],["Sep 2",9,2,"5:30","6:49","1:20","5:00","7:51","9:09"],["Sep 3",9,3,"5:32","6:50","1:20","4:59","7:49","9:07"],["Sep 4",9,4,"5:33","6:51","1:19","4:58","7:47","9:05"],["Sep 5",9,5,"5:34","6:52","1:19","4:57","7:46","9:03"],["Sep 6",9,6,"5:35","6:53","1:19","4:56","7:44","9:01"],["Sep 7",9,7,"5:36","6:54","1:18","4:55","7:42","8:59"],["Sep 8",9,8,"5:37","6:54","1:18","4:54","7:41","8:58"],["Sep 9",9,9,"5:39","6:55","1:18","4:53","7:39","8:56"],["Sep 10",9,10,"5:40","6:56","1:17","4:52","7:37","8:54"],["Sep 11",9,11,"5:41","6:57","1:17","4:51","7:36","8:52"],["Sep 12",9,12,"5:42","6:58","1:17","4:50","7:34","8:50"],["Sep 13",9,13,"5:43","6:59","1:16","4:49","7:32","8:49"],["Sep 14",9,14,"5:44","7:00","1:16","4:48","7:31","8:47"],["Sep 15",9,15,"5:45","7:01","1:15","4:47","7:29","8:45"],["Sep 16",9,16,"5:46","7:02","1:15","4:45","7:27","8:43"],["Sep 17",9,17,"5:47","7:03","1:15","4:44","7:26","8:41"],["Sep 18",9,18,"5:48","7:04","1:14","4:43","7:24","8:40"],["Sep 19",9,19,"5:50","7:05","1:14","4:42","7:22","8:38"],["Sep 20",9,20,"5:51","7:06","1:14","4:41","7:21","8:36"],["Sep 21",9,21,"5:52","7:07","1:13","4:40","7:19","8:34"],["Sep 22",9,22,"5:53","7:08","1:13","4:39","7:17","8:32"],["Sep 23",9,23,"5:54","7:09","1:13","4:38","7:16","8:31"],["Sep 24",9,24,"5:55","7:10","1:12","4:36","7:14","8:29"],["Sep 25",9,25,"5:56","7:11","1:12","4:35","7:12","8:27"],["Sep 26",9,26,"5:57","7:12","1:12","4:34","7:11","8:25"],["Sep 27",9,27,"5:58","7:13","1:11","4:33","7:09","8:24"],["Sep 28",9,28,"5:59","7:14","1:11","4:32","7:07","8:22"],["Sep 29",9,29,"6:00","7:15","1:11","4:30","7:06","8:20"],["Sep 30",9,30,"6:01","7:16","1:10","4:29","7:04","8:19"],
    ["Oct 1",10,1,"6:02","7:17","1:10","4:28","7:02","8:17"],["Oct 2",10,2,"6:03","7:18","1:10","4:27","7:01","8:15"],["Oct 3",10,3,"6:04","7:19","1:09","4:26","6:59","8:14"],["Oct 4",10,4,"6:05","7:20","1:09","4:25","6:57","8:12"],["Oct 5",10,5,"6:06","7:21","1:09","4:23","6:56","8:10"],["Oct 6",10,6,"6:07","7:22","1:08","4:22","6:54","8:09"],["Oct 7",10,7,"6:08","7:23","1:08","4:21","6:53","8:07"],["Oct 8",10,8,"6:09","7:24","1:08","4:20","6:51","8:06"],["Oct 9",10,9,"6:10","7:25","1:08","4:19","6:49","8:04"],["Oct 10",10,10,"6:11","7:26","1:07","4:17","6:48","8:02"],["Oct 11",10,11,"6:12","7:27","1:07","4:16","6:46","8:01"],["Oct 12",10,12,"6:13","7:28","1:07","4:15","6:45","7:59"],["Oct 13",10,13,"6:14","7:29","1:07","4:14","6:43","7:58"],["Oct 14",10,14,"6:15","7:30","1:06","4:13","6:42","7:56"],["Oct 15",10,15,"6:16","7:31","1:06","4:12","6:40","7:55"],["Oct 16",10,16,"6:17","7:32","1:06","4:10","6:39","7:54"],["Oct 17",10,17,"6:18","7:33","1:06","4:09","6:37","7:52"],["Oct 18",10,18,"6:19","7:35","1:05","4:08","6:36","7:51"],["Oct 19",10,19,"6:21","7:36","1:05","4:07","6:34","7:49"],["Oct 20",10,20,"6:22","7:37","1:05","4:06","6:33","7:48"],["Oct 21",10,21,"6:23","7:38","1:05","4:05","6:31","7:47"],["Oct 22",10,22,"6:24","7:39","1:05","4:04","6:30","7:45"],["Oct 23",10,23,"6:25","7:40","1:05","4:03","6:29","7:44"],["Oct 24",10,24,"6:26","7:41","1:04","4:02","6:27","7:43"],["Oct 25",10,25,"6:27","7:42","1:04","4:01","6:26","7:42"],["Oct 26",10,26,"6:28","7:43","1:04","3:59","6:25","7:40"],["Oct 27",10,27,"6:29","7:44","1:04","3:58","6:23","7:39"],["Oct 28",10,28,"6:30","7:46","1:04","3:57","6:22","7:38"],["Oct 29",10,29,"6:31","7:47","1:04","3:56","6:21","7:37"],["Oct 30",10,30,"6:32","7:48","1:04","3:55","6:19","7:36"],["Oct 31",10,31,"6:33","7:49","1:04","3:54","6:18","7:35"],
    ["Nov 1",11,1,"6:34","7:50","1:04","3:53","6:17","7:34"],["Nov 2",11,2,"6:35","7:51","1:04","3:52","6:16","7:33"],["Nov 3",11,3,"6:36","7:53","1:04","3:51","6:14","7:32"],["Nov 4",11,4,"6:37","7:54","1:03","3:50","6:13","7:31"],["Nov 5",11,5,"6:38","7:55","1:03","3:49","6:12","7:30"],["Nov 6",11,6,"6:39","7:56","1:03","3:48","6:11","7:29"],["Nov 7",11,7,"6:40","7:57","1:03","3:47","6:10","7:28"],["Nov 8",11,8,"6:41","7:58","1:03","3:46","6:09","7:27"],["Nov 9",11,9,"6:43","7:59","1:03","3:45","6:07","7:26"],["Nov 10",11,10,"6:44","8:01","1:03","3:44","6:06","7:25"],["Nov 11",11,11,"6:45","8:02","1:03","3:43","6:05","7:25"],["Nov 12",11,12,"6:46","8:03","1:03","3:43","6:04","7:24"],["Nov 13",11,13,"6:47","8:04","1:03","3:42","6:03","7:23"],["Nov 14",11,14,"6:48","8:05","1:03","3:41","6:02","7:22"],["Nov 15",11,15,"6:49","8:06","1:03","3:40","6:01","7:21"],["Nov 16",11,16,"6:50","8:07","1:03","3:39","6:01","7:21"],["Nov 17",11,17,"6:51","8:09","1:03","3:39","6:00","7:20"],["Nov 18",11,18,"6:52","8:10","1:04","3:38","5:59","7:19"],["Nov 19",11,19,"6:54","8:11","1:04","3:37","5:58","7:19"],["Nov 20",11,20,"6:55","8:12","1:04","3:37","5:57","7:18"],["Nov 21",11,21,"6:56","8:13","1:04","3:36","5:57","7:18"],["Nov 22",11,22,"6:57","8:14","1:04","3:36","5:56","7:17"],["Nov 23",11,23,"6:58","8:15","1:04","3:35","5:55","7:17"],["Nov 24",11,24,"6:59","8:16","1:04","3:35","5:55","7:16"],["Nov 25",11,25,"7:00","8:17","1:05","3:34","5:54","7:16"],["Nov 26",11,26,"7:01","8:18","1:05","3:34","5:54","7:16"],["Nov 27",11,27,"7:02","8:19","1:05","3:33","5:53","7:15"],["Nov 28",11,28,"7:03","8:20","1:05","3:33","5:53","7:15"],["Nov 29",11,29,"7:03","8:21","1:05","3:33","5:52","7:15"],["Nov 30",11,30,"7:04","8:22","1:06","3:32","5:52","7:15"],
    ["Dec 1",12,1,"7:05","8:23","1:06","3:32","5:52","7:15"],["Dec 2",12,2,"7:06","8:24","1:06","3:32","5:51","7:14"],["Dec 3",12,3,"7:07","8:25","1:06","3:31","5:51","7:14"],["Dec 4",12,4,"7:08","8:26","1:07","3:31","5:51","7:14"],["Dec 5",12,5,"7:09","8:27","1:07","3:31","5:51","7:14"],["Dec 6",12,6,"7:10","8:27","1:07","3:31","5:50","7:14"],["Dec 7",12,7,"7:10","8:28","1:07","3:31","5:50","7:14"],["Dec 8",12,8,"7:11","8:29","1:08","3:31","5:50","7:15"],["Dec 9",12,9,"7:12","8:30","1:08","3:31","5:50","7:15"],["Dec 10",12,10,"7:13","8:30","1:08","3:31","5:50","7:15"],["Dec 11",12,11,"7:13","8:31","1:09","3:31","5:50","7:15"],["Dec 12",12,12,"7:14","8:32","1:09","3:31","5:50","7:15"],["Dec 13",12,13,"7:15","8:32","1:09","3:31","5:50","7:16"],["Dec 14",12,14,"7:15","8:33","1:10","3:31","5:50","7:16"],["Dec 15",12,15,"7:16","8:33","1:10","3:31","5:50","7:16"],["Dec 16",12,16,"7:16","8:34","1:10","3:32","5:50","7:17"],["Dec 17",12,17,"7:17","8:34","1:11","3:32","5:51","7:17"],["Dec 18",12,18,"7:17","8:35","1:11","3:32","5:51","7:18"],["Dec 19",12,19,"7:18","8:35","1:11","3:32","5:51","7:18"],["Dec 20",12,20,"7:18","8:36","1:12","3:33","5:51","7:19"],["Dec 21",12,21,"7:18","8:36","1:12","3:33","5:52","7:19"],["Dec 22",12,22,"7:19","8:36","1:12","3:34","5:52","7:20"],["Dec 23",12,23,"7:19","8:37","1:13","3:34","5:53","7:20"],["Dec 24",12,24,"7:19","8:37","1:13","3:35","5:53","7:21"],["Dec 25",12,25,"7:19","8:37","1:13","3:35","5:54","7:22"],["Dec 26",12,26,"7:20","8:37","1:14","3:36","5:54","7:22"],["Dec 27",12,27,"7:20","8:37","1:14","3:36","5:55","7:23"],["Dec 28",12,28,"7:20","8:37","1:14","3:37","5:56","7:24"],["Dec 29",12,29,"7:20","8:37","1:15","3:38","5:56","7:25"],["Dec 30",12,30,"7:20","8:37","1:15","3:38","5:57","7:25"],["Dec 31",12,31,"7:20","8:37","1:15","3:39","5:58","7:26"],
    ["Jan 1",1,1,"7:20","8:37","1:16","3:40","5:59","7:27"],["Jan 2",1,2,"7:20","8:37","1:16","3:41","5:59","7:28"],["Jan 3",1,3,"7:19","8:37","1:16","3:41","6:00","7:29"],["Jan 4",1,4,"7:19","8:36","1:17","3:42","6:01","7:30"],["Jan 5",1,5,"7:19","8:36","1:17","3:43","6:02","7:31"],["Jan 6",1,6,"7:19","8:36","1:17","3:44","6:03","7:32"],["Jan 7",1,7,"7:18","8:35","1:18","3:45","6:04","7:33"],["Jan 8",1,8,"7:18","8:35","1:18","3:46","6:05","7:34"],["Jan 9",1,9,"7:17","8:34","1:18","3:47","6:06","7:35"],["Jan 10",1,10,"7:17","8:34","1:19","3:48","6:07","7:36"],["Jan 11",1,11,"7:16","8:33","1:19","3:49","6:08","7:37"],["Jan 12",1,12,"7:16","8:32","1:19","3:50","6:09","7:38"],["Jan 13",1,13,"7:15","8:32","1:20","3:51","6:10","7:39"],["Jan 14",1,14,"7:15","8:31","1:20","3:52","6:11","7:40"],["Jan 15",1,15,"7:14","8:30","1:20","3:53","6:13","7:42"],["Jan 16",1,16,"7:13","8:29","1:21","3:54","6:14","7:43"],["Jan 17",1,17,"7:12","8:29","1:21","3:55","6:15","7:44"],["Jan 18",1,18,"7:12","8:28","1:21","3:56","6:16","7:45"],["Jan 19",1,19,"7:11","8:27","1:21","3:57","6:17","7:46"],["Jan 20",1,20,"7:10","8:26","1:22","3:58","6:19","7:48"],["Jan 21",1,21,"7:09","8:25","1:22","3:59","6:20","7:49"],["Jan 22",1,22,"7:08","8:24","1:22","4:00","6:21","7:50"],["Jan 23",1,23,"7:07","8:23","1:22","4:02","6:22","7:51"],["Jan 24",1,24,"7:06","8:22","1:23","4:03","6:24","7:52"],["Jan 25",1,25,"7:05","8:21","1:23","4:04","6:25","7:54"],["Jan 26",1,26,"7:04","8:20","1:23","4:05","6:26","7:55"],["Jan 27",1,27,"7:03","8:19","1:23","4:06","6:28","7:56"],["Jan 28",1,28,"7:02","8:17","1:23","4:07","6:29","7:57"],["Jan 29",1,29,"7:01","8:16","1:24","4:09","6:30","7:58"],["Jan 30",1,30,"6:59","8:15","1:24","4:10","6:32","8:00"],["Jan 31",1,31,"6:58","8:13","1:24","4:11","6:33","8:01"],
    ["Feb 1",2,1,"6:57","8:12","1:24","4:12","6:34","8:02"],["Feb 2",2,2,"6:56","8:11","1:24","4:13","6:36","8:03"],["Feb 3",2,3,"6:54","8:09","1:24","4:14","6:37","8:04"],["Feb 4",2,4,"6:53","8:08","1:24","4:16","6:38","8:06"],["Feb 5",2,5,"6:51","8:06","1:24","4:17","6:40","8:07"],["Feb 6",2,6,"6:50","8:05","1:25","4:18","6:41","8:08"],["Feb 7",2,7,"6:49","8:03","1:25","4:19","6:42","8:09"],["Feb 8",2,8,"6:47","8:02","1:25","4:21","6:44","8:10"],["Feb 9",2,9,"6:46","8:00","1:25","4:22","6:45","8:12"],["Feb 10",2,10,"6:44","7:59","1:25","4:23","6:47","8:13"],["Feb 11",2,11,"6:43","7:57","1:25","4:24","6:48","8:14"],["Feb 12",2,12,"6:41","7:55","1:25","4:25","6:49","8:15"],["Feb 13",2,13,"6:39","7:54","1:25","4:27","6:51","8:16"],["Feb 14",2,14,"6:38","7:52","1:25","4:28","6:52","8:18"],["Feb 15",2,15,"6:36","7:50","1:25","4:29","6:53","8:19"],["Feb 16",2,16,"6:35","7:49","1:25","4:30","6:55","8:20"],["Feb 17",2,17,"6:33","7:47","1:25","4:32","6:56","8:21"],["Feb 18",2,18,"6:31","7:45","1:24","4:33","6:58","8:22"],["Feb 19",2,19,"6:30","7:44","1:24","4:34","6:59","8:23"],["Feb 20",2,20,"6:28","7:42","1:24","4:35","7:00","8:25"],["Feb 21",2,21,"6:26","7:40","1:24","4:37","7:02","8:26"],["Feb 22",2,22,"6:25","7:38","1:24","4:38","7:03","8:27"],["Feb 23",2,23,"6:23","7:37","1:24","4:39","7:05","8:28"],["Feb 24",2,24,"6:21","7:35","1:23","4:40","7:06","8:29"],["Feb 25",2,25,"6:19","7:33","1:23","4:42","7:07","8:30"],["Feb 26",2,26,"6:18","7:31","1:23","4:43","7:09","8:32"],["Feb 27",2,27,"6:16","7:29","1:23","4:44","7:10","8:33"],["Feb 28",2,28,"6:14","7:27","1:22","4:45","7:12","8:34"],
    ["Mar 1",3,1,"6:12","7:26","1:22","4:47","7:13","8:35"],["Mar 2",3,2,"6:10","7:24","1:22","4:48","7:14","8:36"],["Mar 3",3,3,"6:09","7:22","1:21","4:49","7:16","8:37"],["Mar 4",3,4,"6:07","7:20","1:21","4:50","7:17","8:38"],["Mar 5",3,5,"6:05","7:18","1:21","4:52","7:19","8:40"],["Mar 6",3,6,"6:03","7:17","1:20","4:53","7:20","8:41"],["Mar 7",3,7,"6:01","7:15","1:20","4:54","7:21","8:42"],["Mar 8",3,8,"6:59","8:13","1:20","4:55","8:23","9:43"],["Mar 9",3,9,"6:57","8:11","1:19","4:57","8:24","9:44"],["Mar 10",3,10,"6:55","8:09","1:19","4:58","8:26","9:45"],["Mar 11",3,11,"6:53","8:07","1:18","4:59","8:27","9:46"],["Mar 12",3,12,"6:51","8:06","1:18","5:00","8:28","9:47"],["Mar 13",3,13,"6:49","8:04","1:18","5:02","8:30","9:48"],["Mar 14",3,14,"6:47","8:02","1:17","5:03","8:31","9:49"],["Mar 15",3,15,"6:45","8:00","1:17","5:04","8:33","9:51"],["Mar 16",3,16,"6:43","7:58","1:17","5:05","8:34","9:52"],["Mar 17",3,17,"6:41","7:56","1:16","5:07","8:35","9:53"],["Mar 18",3,18,"6:39","7:54","1:16","5:08","8:37","9:54"],["Mar 19",3,19,"6:37","7:53","1:15","5:09","8:38","9:55"],["Mar 20",3,20,"6:35","7:51","1:15","5:10","8:39","9:56"],["Mar 21",3,21,"6:33","7:49","1:14","5:12","8:41","9:57"],["Mar 22",3,22,"6:31","7:47","1:14","5:13","8:42","9:58"],["Mar 23",3,23,"6:29","7:45","1:14","5:14","8:44","10:00"],["Mar 24",3,24,"6:27","7:43","1:13","5:15","8:45","10:01"],["Mar 25",3,25,"6:25","7:41","1:13","5:17","8:46","10:02"],["Mar 26",3,26,"6:23","7:39","1:12","5:18","8:48","10:03"],["Mar 27",3,27,"6:21","7:38","1:12","5:19","8:49","10:04"],["Mar 28",3,28,"6:19","7:36","1:11","5:20","8:51","10:05"],["Mar 29",3,29,"6:17","7:34","1:11","5:22","8:52","10:06"],["Mar 30",3,30,"6:15","7:32","1:11","5:23","8:53","10:07"],["Mar 31",3,31,"6:13","7:30","1:10","5:24","8:55","10:09"],
    ["Apr 1",4,1,"6:11","7:28","1:10","5:25","8:56","10:10"],["Apr 2",4,2,"6:09","7:26","1:09","5:27","8:58","10:11"],["Apr 3",4,3,"6:07","7:24","1:09","5:28","8:59","10:12"],["Apr 4",4,4,"6:05","7:22","1:08","5:29","9:00","10:13"],["Apr 5",4,5,"6:03","7:21","1:08","5:30","9:02","10:14"],["Apr 6",4,6,"6:01","7:19","1:08","5:32","9:03","10:15"],["Apr 7",4,7,"5:59","7:17","1:07","5:33","9:05","10:17"],["Apr 8",4,8,"5:57","7:15","1:07","5:34","9:06","10:18"],["Apr 9",4,9,"5:55","7:13","1:06","5:35","9:07","10:19"],["Apr 10",4,10,"5:53","7:11","1:06","5:37","9:09","10:20"],["Apr 11",4,11,"5:51","7:09","1:05","5:38","9:10","10:21"],["Apr 12",4,12,"5:49","7:07","1:05","5:39","9:12","10:23"],["Apr 13",4,13,"5:47","7:06","1:05","5:41","9:13","10:24"],["Apr 14",4,14,"5:45","7:04","1:04","5:42","9:14","10:25"],["Apr 15",4,15,"5:43","7:02","1:04","5:43","9:16","10:26"],["Apr 16",4,16,"5:41","7:00","1:03","5:44","9:17","10:27"],["Apr 17",4,17,"5:39","6:58","1:03","5:46","9:19","10:29"],["Apr 18",4,18,"5:37","6:56","1:03","5:47","9:20","10:30"],["Apr 19",4,19,"5:35","6:55","1:02","5:48","9:22","10:31"],["Apr 20",4,20,"5:33","6:53","1:02","5:50","9:23","10:32"],["Apr 21",4,21,"5:31","6:51","1:01","5:51","9:24","10:33"],["Apr 22",4,22,"5:29","6:49","1:01","5:52","9:26","10:35"],["Apr 23",4,23,"5:27","6:47","1:01","5:53","9:27","10:36"],["Apr 24",4,24,"5:25","6:46","1:00","5:55","9:29","10:37"],["Apr 25",4,25,"5:23","6:44","1:00","5:56","9:30","10:38"],["Apr 26",4,26,"5:21","6:42","12:59","5:57","9:32","10:40"],["Apr 27",4,27,"5:19","6:40","12:59","5:59","9:33","10:41"],["Apr 28",4,28,"5:18","6:39","12:59","6:00","9:34","10:42"],["Apr 29",4,29,"5:16","6:37","12:58","6:01","9:36","10:43"],["Apr 30",4,30,"5:14","6:35","12:58","6:03","9:37","10:45"],
  ];

  const labels = raw.map(r => r[0]);
  const GRID = "rgba(0,0,0,0.06)";
  const TICK = "rgba(0,0,0,0.35)";

  let activeIdxRef = activeIdx;

  function dotPlugin() {
    return {
      id: "dot",
      afterDatasetsDraw(ch: any) {
        if (activeIdxRef === -1) return;
        const { ctx, chartArea: { top, bottom }, scales: { x, y } } = ch;
        ch.data.datasets.forEach((ds: any, di: number) => {
          if (ds.hidden) return;
          const val = ds.data[activeIdxRef];
          if (val == null) return;
          const px = x.getPixelForValue(activeIdxRef);
          const py = y.getPixelForValue(val);
          if (py < top - 1 || py > bottom + 1) return;
          ctx.save(); ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fillStyle = ds.borderColor; ctx.fill();
          ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();
          ctx.restore();
        });
      }
    };
  }

  const zones = [
    { mo: 10, d1: 9,  d2: 11, fill: "rgba(186,117,23,0.10)" },
    { mo: 11, d1: 22, d2: 29, fill: "rgba(186,117,23,0.10)" },
    { mo: 12, d1: 13, d2: 31, fill: "rgba(186,117,23,0.10)" },
    { mo: 1,  d1: 1,  d2: 10, fill: "rgba(186,117,23,0.10)" },
    { mo: 3,  d1: 7,  d2: 13, fill: "rgba(186,117,23,0.10)" },
    { mo: 2,  d1: 8,  d2: 28, fill: "rgba(29,158,117,0.09)" },
    { mo: 3,  d1: 1,  d2: 8,  fill: "rgba(29,158,117,0.09)" },
  ];
  const zoneLbls = [
    { mo: 10, d: 9,  txt: "Fall Break" },
    { mo: 11, d: 22, txt: "Thanksgiving" },
    { mo: 12, d: 13, txt: "Winter Recess" },
    { mo: 3,  d: 7,  txt: "Spring Recess" },
    { mo: 2,  d: 8,  txt: "Ramadan" },
  ];

  function bgPlugin() {
    return {
      id: "bg",
      beforeDraw(ch: any) {
        const { ctx, chartArea: { left, right, top, bottom }, scales: { x } } = ch;
        zones.forEach(z => {
          const si = raw.findIndex(r => r[1] === z.mo && r[2] === z.d1);
          const ei = raw.findIndex(r => r[1] === z.mo && r[2] === z.d2);
          if (si < 0 || ei < 0) return;
          const x1 = Math.max(left, x.getPixelForValue(si - 0.5));
          const x2 = Math.min(right, x.getPixelForValue(ei + 0.5));
          ctx.fillStyle = z.fill; ctx.fillRect(x1, top, x2 - x1, bottom - top);
        });
        ctx.save();
        ctx.font = "10px 'Plus Jakarta Sans',system-ui,sans-serif";
        ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.textAlign = "center";
        zoneLbls.forEach(l => {
          const i = raw.findIndex(r => r[1] === l.mo && r[2] === l.d);
          if (i < 0) return;
          const px = x.getPixelForValue(i);
          if (px > left && px < right) ctx.fillText(l.txt, px + 2, top + 12);
        });
        ctx.restore();
      }
    };
  }

  const F = "'Plus Jakarta Sans',system-ui,sans-serif";
  const xCfg = {
    ticks: {
      color: TICK, font: { size: 11, family: F }, maxRotation: 0, autoSkip: true,
      callback(v: any, i: number) { const r = raw[i]; return r && r[2] === 1 ? r[0].split(" ")[0] : null; }
    },
    grid: { color: GRID }
  };
  function mkDs(label: string, data: number[], color: string, dash: number[]) {
    return { label, data, borderColor: color, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 0, borderDash: dash, tension: 0.35 };
  }

  topChart = new Chart(document.getElementById("ctop"), {
    type: "line",
    data: {
      labels,
      datasets: [
        mkDs("Fajr",   raw.map(r => toM(r[3], false)), "#EF7C1A", []),
        mkDs("Shuruq", raw.map(r => toM(r[4], false)), "#EFC11A", [4, 3]),
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: false }, tooltip: { enabled: false, external: (ctx: any) => handleTip(ctx, topChart, botChart) } },
      scales: {
        x: xCfg,
        y: {
          reverse: true, min: 4 * 60, max: 8 * 60 + 30,
          ticks: { color: TICK, font: { size: 11, family: F }, stepSize: 30,
            callback(v: any) { const h = Math.floor(v / 60), m = v % 60; return h + ":" + (m === 0 ? "00" : "30") + "am"; }
          },
          grid: { color: GRID }
        }
      }
    },
    plugins: [bgPlugin(), dotPlugin()]
  });

  botChart = new Chart(document.getElementById("cbot"), {
    type: "line",
    data: {
      labels,
      datasets: [
        mkDs("Dhuhr",   raw.map(r => toM(r[5], true)), "#97C459", [8, 3]),
        mkDs("Asr",     raw.map(r => toM(r[6], true)), "#3B6D11", [4, 3, 1, 3]),
        mkDs("Maghrib", raw.map(r => toM(r[7], true)), "#378ADD", []),
        mkDs("Isha",    raw.map(r => toM(r[8], true)), "#7F77DD", [5, 3]),
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: false }, tooltip: { enabled: false, external: (ctx: any) => handleTip(ctx, topChart, botChart) } },
      scales: {
        x: xCfg,
        y: {
          reverse: true, min: 12 * 60, max: 22 * 60 + 30,
          ticks: { color: TICK, font: { size: 11, family: F }, stepSize: 60,
            callback(v: any) { const h = Math.floor(v / 60) % 24, hh = h > 12 ? h - 12 : h === 0 ? 12 : h; return hh + (h < 12 ? "am" : "pm"); }
          },
          grid: { color: GRID }
        }
      }
    },
    plugins: [bgPlugin(), dotPlugin()]
  });

  function handleTip(ctx: any, topCh: any, botCh: any) {
    const tip = document.getElementById("chart-tip");
    if (!tip) return;
    if (ctx.tooltip.opacity === 0) {
      tip.style.display = "none";
      if (activeIdxRef !== -1) { activeIdxRef = -1; topCh?.update("none"); botCh?.update("none"); }
      return;
    }
    const idx = ctx.tooltip.dataPoints[0].dataIndex;
    if (idx !== activeIdxRef) { activeIdxRef = idx; topCh?.update("none"); botCh?.update("none"); }
    const r = raw[idx];
    const ram = isRam(r[1], r[2]), brk = getBrk(r[1], r[2]);
    let html = `<strong>${r[0]}</strong>`;
    if (ram) { const day = r[1] === 2 ? r[2] - 7 : r[2] + 21; html += `<span class="chart-badge chart-badge-ram">Ramadan ${day}</span><br>`; }
    else if (brk) { html += `<span class="chart-badge chart-badge-brk">${brk}</span><br>`; }
    [
      { n: "Fajr",    c: "#EF7C1A", m: toM(r[3], false) },
      { n: "Shuruq",  c: "#EFC11A", m: toM(r[4], false) },
      { n: "Dhuhr",   c: "#97C459", m: toM(r[5], true)  },
      { n: "Asr",     c: "#3B6D11", m: toM(r[6], true)  },
      { n: "Maghrib", c: "#378ADD", m: toM(r[7], true)  },
      { n: "Isha",    c: "#7F77DD", m: toM(r[8], true)  },
    ].forEach((p, i) => {
      if (!vis[i]) return;
      html += `<div class="chart-tr"><span class="chart-lbl"><span style="width:8px;height:8px;border-radius:2px;background:${p.c};display:inline-block"></span>${p.n}</span><span class="chart-val">${fmt(p.m)}</span></div>`;
    });
    tip.innerHTML = html; tip.style.display = "block";
    const wRect = document.getElementById("chart-wrap")!.getBoundingClientRect();
    const cRect = ctx.chart.canvas.getBoundingClientRect();
    const relTop = cRect.top - wRect.top, x = ctx.tooltip.caretX, cw = ctx.chart.width;
    const tw = tip.offsetWidth || 165, th = tip.offsetHeight || 170;
    tip.style.left = (x > cw * 0.65 ? x - tw - 10 : x + 12) + "px";
    tip.style.top = Math.max(0, relTop + ctx.tooltip.caretY - th / 2) + "px";
  }

  const togCont = document.getElementById("togs");
  if (togCont) {
    PRAYERS.forEach((p, i) => {
      const b = document.createElement("div");
      b.className = "chart-tog";
      b.innerHTML = `<span class="chart-sw" style="background:${p.c}"></span>${p.n}`;
      b.onclick = () => {
        vis[i] = !vis[i];
        const ch = p.panel === 0 ? topChart : botChart;
        ch.data.datasets[p.panel === 0 ? i : i - 2].hidden = !vis[i];
        b.classList.toggle("off", !vis[i]);
        ch.update();
      };
      togCont.appendChild(b);
    });
  }
}

export default PrayerTimes;
