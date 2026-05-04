import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES } from "@/lib/sanity";

/**
 * Static, presentational org chart for the public About page.
 *
 * Architecture:
 *   - Pure presentational; no interactive editing (that lives at /board).
 *   - SVG connectors are drawn between DOM nodes after layout settles
 *     using getBoundingClientRect, with a ResizeObserver redraw.
 *   - On mobile, the chart collapses into a clean stacked list with
 *     a left-rail accent — no dropdowns.
 *
 * Hierarchy:
 *   President
 *   ├─ Secretary
 *   ├─ External VP ──→ External committees (Advocacy, B-Da'wah, S-Da'wah)
 *   ├─ Internal VP ──→ Internal committees (B-Social, S-Social, Marketing)
 *   ├─ Business Manager
 *   └─ Community Engagement Council (central, links to mosques)
 */

interface LeadershipData {
  academicYear?: string;
  presidentName?: string;
  internalVPName?: string;
  externalVPName?: string;
  secretaryName?: string;
  businessManagerName?: string;
  cecChairName?: string;
  brothersSocialChairName?: string;
  sistersSocialChairName?: string;
  marketingChairName?: string;
  advocacyChairName?: string;
  brothersDawahChairName?: string;
  sistersDawahChairName?: string;
}

type NodeColor =
  | "navy"     // President
  | "gold"     // External / Internal VPs
  | "gray"     // Secretary
  | "green"    // Business Manager
  | "teal"     // CEC
  | "blue"     // Brothers committees
  | "pink"     // Sisters committees
  | "coral"    // Advocacy
  | "purple"   // Brothers Social
  | "amber"    // Sisters Social
  | "red";     // Marketing

const colorClasses: Record<NodeColor, string> = {
  navy:   "bg-[#E6F1FB] text-[#0C447C] dark:bg-[#0C447C]/20 dark:text-[#A6CDF1]",
  gold:   "bg-[#FAEEDA] text-[#633806] dark:bg-[#633806]/25 dark:text-[#F2AB23]",
  gray:   "bg-[#F1EFE8] text-[#444441] dark:bg-white/[0.05] dark:text-white/70",
  green:  "bg-[#EAF3DE] text-[#27500A] dark:bg-[#27500A]/25 dark:text-[#A8D67E]",
  teal:   "bg-[#E1F5EE] text-[#085041] dark:bg-[#085041]/25 dark:text-[#7BC4AC]",
  blue:   "bg-[#dbeeff] text-[#0C447C] dark:bg-[#0C447C]/20 dark:text-[#A6CDF1]",
  pink:   "bg-[#FBEAF0] text-[#72243E] dark:bg-[#72243E]/25 dark:text-[#E5A0BA]",
  coral:  "bg-[#FAECE7] text-[#712B13] dark:bg-[#712B13]/25 dark:text-[#E5A88E]",
  purple: "bg-[#EEEDFE] text-[#3C3489] dark:bg-[#3C3489]/25 dark:text-[#B8B0F0]",
  amber:  "bg-[#FFF3D6] text-[#633806] dark:bg-[#633806]/25 dark:text-[#F2C56C]",
  red:    "bg-[#FCEBEB] text-[#791F1F] dark:bg-[#791F1F]/25 dark:text-[#E89A9A]",
};

interface NodeSpec {
  id: string;
  role: string;
  name?: string;
  color: NodeColor;
}

const Node = ({ spec, large = false }: { spec: NodeSpec; large?: boolean }) => (
  <div
    data-node-id={spec.id}
    className={`oc-node relative rounded-xl border border-border/40 bg-card overflow-hidden transition-shadow duration-200 hover:shadow-md ${
      large ? "min-w-[200px] md:min-w-[230px]" : "min-w-[150px] md:min-w-[170px]"
    }`}
  >
    <div
      className={`px-3.5 py-2 ${colorClasses[spec.color]} font-body font-semibold text-[13px] leading-tight border-b border-border/30 truncate`}
    >
      {spec.role}
    </div>
    <div className="px-3.5 py-2.5 min-h-[36px] flex items-center">
      <p className="font-body text-[13px] text-foreground/85 leading-snug truncate">
        {spec.name || <span className="text-muted-foreground/50 italic">—</span>}
      </p>
    </div>
  </div>
);

const OrgChart = () => {
  const { data } = useSanityData<LeadershipData>(QUERIES.leadership);
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Map Sanity → node specs
  const president: NodeSpec = {
    id: "president",
    role: "President",
    name: data?.presidentName,
    color: "navy",
  };
  const secretary: NodeSpec = {
    id: "secretary",
    role: "Secretary",
    name: data?.secretaryName,
    color: "gray",
  };
  const extVP: NodeSpec = {
    id: "ext-vp",
    role: "External VP",
    name: data?.externalVPName,
    color: "gold",
  };
  const intVP: NodeSpec = {
    id: "int-vp",
    role: "Internal VP",
    name: data?.internalVPName,
    color: "gold",
  };
  const bizMgr: NodeSpec = {
    id: "biz-mgr",
    role: "Business Manager",
    name: data?.businessManagerName,
    color: "green",
  };
  const cec: NodeSpec = {
    id: "cec",
    role: "Community Engagement Council",
    name: data?.cecChairName,
    color: "teal",
  };
  const advocacy: NodeSpec = {
    id: "advocacy",
    role: "Advocacy Chair",
    name: data?.advocacyChairName,
    color: "coral",
  };
  const brosDawah: NodeSpec = {
    id: "bros-dawah",
    role: "Brothers Da'wah",
    name: data?.brothersDawahChairName,
    color: "blue",
  };
  const sisDawah: NodeSpec = {
    id: "sis-dawah",
    role: "Sisters Da'wah",
    name: data?.sistersDawahChairName,
    color: "pink",
  };
  const brosSocial: NodeSpec = {
    id: "bros-social",
    role: "Brothers Social",
    name: data?.brothersSocialChairName,
    color: "purple",
  };
  const sisSocial: NodeSpec = {
    id: "sis-social",
    role: "Sisters Social",
    name: data?.sistersSocialChairName,
    color: "amber",
  };
  const marketing: NodeSpec = {
    id: "marketing",
    role: "Marketing Chair",
    name: data?.marketingChairName,
    color: "red",
  };

  // Mosque partners under CEC (these are static)
  const cecMosques = ["Attawheed", "ICWP/MAP", "ICP", "MCCGP"];

  // Draw the connector lines after layout settles + on resize
  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg) return;

    const draw = () => {
      const wr = wrap.getBoundingClientRect();
      svg.setAttribute("width", String(wr.width));
      svg.setAttribute("height", String(wr.height));
      svg.innerHTML = "";

      const center = (id: string, side: "top" | "bottom") => {
        const el = wrap.querySelector(`[data-node-id="${id}"]`) as HTMLElement | null;
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.left - wr.left + r.width / 2,
          y: side === "top" ? r.top - wr.top : r.top - wr.top + r.height,
        };
      };

      const drawCurve = (
        from: { x: number; y: number } | null,
        to: { x: number; y: number } | null,
        stroke = "currentColor",
        opacity = 0.35,
      ) => {
        if (!from || !to) return;
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const my = (from.y + to.y) / 2;
        path.setAttribute(
          "d",
          `M ${from.x} ${from.y} C ${from.x} ${my}, ${to.x} ${my}, ${to.x} ${to.y}`,
        );
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", stroke);
        path.setAttribute("stroke-opacity", String(opacity));
        path.setAttribute("stroke-width", "1.25");
        path.setAttribute("stroke-linecap", "round");
        svg.appendChild(path);
      };

      const presBottom = center("president", "bottom");
      // President → all 5 (Secretary, ExtVP, IntVP, BizMgr, CEC)
      drawCurve(presBottom, center("secretary", "top"));
      drawCurve(presBottom, center("ext-vp", "top"));
      drawCurve(presBottom, center("int-vp", "top"));
      drawCurve(presBottom, center("biz-mgr", "top"));
      drawCurve(presBottom, center("cec", "top"), "#148066", 0.45);

      // External VP → external committees
      const extBottom = center("ext-vp", "bottom");
      drawCurve(extBottom, center("advocacy", "top"), "#C9A84C", 0.45);
      drawCurve(extBottom, center("bros-dawah", "top"), "#C9A84C", 0.45);
      drawCurve(extBottom, center("sis-dawah", "top"), "#C9A84C", 0.45);

      // Internal VP → internal committees
      const intBottom = center("int-vp", "bottom");
      drawCurve(intBottom, center("bros-social", "top"), "#C9A84C", 0.45);
      drawCurve(intBottom, center("sis-social", "top"), "#C9A84C", 0.45);
      drawCurve(intBottom, center("marketing", "top"), "#C9A84C", 0.45);
    };

    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(wrap);
    window.addEventListener("resize", draw);

    // One more draw after fonts settle
    const t = setTimeout(draw, 120);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", draw);
      clearTimeout(t);
    };
  }, [data]);

  return (
    <div className="w-full">
      {data?.academicYear && (
        <p className="text-center font-body text-xs text-muted-foreground/60 mb-8 tracking-[0.2em] uppercase font-semibold">
          {data.academicYear} Board
        </p>
      )}

      {/* ── Desktop / tablet — full org chart with connector lines ─────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="hidden md:block relative"
        ref={wrapRef}
      >
        <svg
          ref={svgRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none text-muted-foreground/60"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Tier 1 — President */}
        <div className="flex justify-center mb-12">
          <Node spec={president} large />
        </div>

        {/* Tier 2 — Exec board (Secretary, External VP, Internal VP, Business Manager) */}
        <div className="flex justify-center gap-6 lg:gap-8 mb-14 flex-wrap">
          <Node spec={secretary} />
          <Node spec={extVP} />
          <Node spec={intVP} />
          <Node spec={bizMgr} />
        </div>

        {/* Tier 3a — Committee groups (External | CEC central | Internal) */}
        <div className="grid grid-cols-3 gap-4 lg:gap-6 mb-2 items-start">
          {/* External committees */}
          <div className="rounded-2xl border border-border/40 bg-background/40 backdrop-blur-sm p-4 lg:p-5">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 text-center mb-4 flex items-center gap-2 justify-center">
              <span className="flex-1 h-px bg-border/40" />
              External
              <span className="flex-1 h-px bg-border/40" />
            </p>
            <div className="flex flex-col gap-2.5">
              <Node spec={advocacy} />
              <Node spec={brosDawah} />
              <Node spec={sisDawah} />
            </div>
          </div>

          {/* CEC central */}
          <div className="flex flex-col items-center gap-3 pt-3">
            <Node spec={cec} large />
            <div className="rounded-2xl border border-border/40 bg-background/40 backdrop-blur-sm p-4 lg:p-5 w-full">
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 text-center mb-3">
                Mosque Partners
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {cecMosques.map((m) => (
                  <span
                    key={m}
                    className="font-body text-[11px] px-2.5 py-1 rounded-full bg-[#E1F5EE] text-[#085041] dark:bg-[#085041]/30 dark:text-[#7BC4AC] font-semibold"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Internal committees */}
          <div className="rounded-2xl border border-border/40 bg-background/40 backdrop-blur-sm p-4 lg:p-5">
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 text-center mb-4 flex items-center gap-2 justify-center">
              <span className="flex-1 h-px bg-border/40" />
              Internal
              <span className="flex-1 h-px bg-border/40" />
            </p>
            <div className="flex flex-col gap-2.5">
              <Node spec={brosSocial} />
              <Node spec={sisSocial} />
              <Node spec={marketing} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Mobile — clean grouped stack, no dropdowns ───────────────── */}
      <div className="md:hidden flex flex-col gap-4">
        <Node spec={president} large />

        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 text-center mt-3 -mb-1">
          — Executive Board —
        </p>
        <Node spec={secretary} />
        <Node spec={extVP} />
        <Node spec={intVP} />
        <Node spec={bizMgr} />

        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 text-center mt-3 -mb-1">
          — Community Engagement —
        </p>
        <Node spec={cec} large />
        <div className="rounded-2xl border border-border/40 bg-background/40 backdrop-blur-sm p-4 -mt-1">
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 text-center mb-3">
            Mosque Partners
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {cecMosques.map((m) => (
              <span
                key={m}
                className="font-body text-[11px] px-2.5 py-1 rounded-full bg-[#E1F5EE] text-[#085041] dark:bg-[#085041]/30 dark:text-[#7BC4AC] font-semibold"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 text-center mt-3 -mb-1">
          — External Committees —
        </p>
        <Node spec={advocacy} />
        <Node spec={brosDawah} />
        <Node spec={sisDawah} />

        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 text-center mt-3 -mb-1">
          — Internal Committees —
        </p>
        <Node spec={brosSocial} />
        <Node spec={sisSocial} />
        <Node spec={marketing} />
      </div>
    </div>
  );
};

export default OrgChart;
