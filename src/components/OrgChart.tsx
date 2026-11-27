import { usePartners } from "./PartnerLogos";
import { Content,LinkField,Picture,TextField, ContentScope, itemIdentity } from "@/editor/content";
import { useContext, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES } from "@/lib/sanity";

import { getCollection, findAvailable } from "@/editor/visual-model";

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

type NodeColor = "navy" | "gold" | "gray" | "green" | "teal" | "blue" | "pink" | "coral" | "purple" | "amber" | "red";

const headerClasses: Record<NodeColor, string> = {
  navy:   "bg-[#E6F1FB] text-[#0C447C] dark:bg-[#0C447C]/25 dark:text-[#A6CDF1]",
  gold:   "bg-[#FAEEDA] text-[#633806] dark:bg-[#633806]/30 dark:text-[var(--gold)]",
  gray:   "bg-[#F1EFE8] text-[#444441] dark:bg-white/[0.06] dark:text-white/70",
  green:  "bg-[#EAF3DE] text-[#27500A] dark:bg-[#27500A]/30 dark:text-[#A8D67E]",
  teal:   "bg-[#E1F5EE] text-[#085041] dark:bg-[#085041]/30 dark:text-[#7BC4AC]",
  blue:   "bg-[#dbeeff] text-[#0C447C] dark:bg-[#0C447C]/25 dark:text-[#A6CDF1]",
  pink:   "bg-[#FBEAF0] text-[#72243E] dark:bg-[#72243E]/30 dark:text-[#E5A0BA]",
  coral:  "bg-[#FAECE7] text-[#712B13] dark:bg-[#712B13]/30 dark:text-[#E5A88E]",
  purple: "bg-[#EEEDFE] text-[#3C3489] dark:bg-[#3C3489]/30 dark:text-[#B8B0F0]",
  amber:  "bg-[#FFF3D6] text-[#633806] dark:bg-[#633806]/30 dark:text-[#F2C56C]",
  red:    "bg-[#FCEBEB] text-[#791F1F] dark:bg-[#791F1F]/30 dark:text-[#E89A9A]",
};

interface NodeSpec { id: string; role: string; name?: string; color: NodeColor; image?: string; bio?: string; hidden?: boolean; }

const Node = ({ spec, large = false }: { spec: NodeSpec; large?: boolean }) => spec.hidden ? null : (
  <div
    data-node-id={spec.id}
    className={`relative rounded-xl border border-border/40 bg-card overflow-hidden transition-shadow duration-200 hover:shadow-md ${
      large ? "min-w-[200px]" : "min-w-[148px]"
    }`}
  >
    <div className={`px-3 py-2 ${headerClasses[spec.color]} font-body font-semibold text-[12px] leading-tight border-b border-border/30 truncate`}>
      <TextField id="OrgChart_1">{spec.role}</TextField>
    </div>
    <div className="px-3 py-2 min-h-[34px] flex items-center">
      {spec.image && <Picture fieldId="board-photo" className="w-9 h-9 rounded-full object-cover mr-2" src={spec.image} alt="" loading="lazy" />}
      <p className="font-body text-[12px] text-foreground/80 leading-snug truncate">
        {spec.name ? <TextField id="board-name">{spec.name}</TextField> : <span className="text-muted-foreground/40 italic text-[11px]"><TextField id="OrgChart_2">TBD</TextField></span>}
      </p>
    </div>
    {spec.bio && <p className="px-3 pb-2 text-xs"><TextField id="board-bio">{spec.bio}</TextField></p>}
  </div>
);

function MosquePartners({ phone = false }: { phone?: boolean }) {
  const partners = usePartners();
  return (
    <div className="cec-partners">
      {partners.filter(partner => partner.group === "Mosque").map(partner => (
        <LinkField key={partner.shortName} fieldId={"partner-" + partner.shortName} href={partner.href} title={partner.name}>
          <Picture fieldId={"partner-logo-" + partner.shortName} src={partner.src?.startsWith("/partners/") ? partner.src.replace(/\.[^.]+$/, ".webp") : partner.src} alt="" loading="lazy" width={20} height={20} />
          <ContentScope id={(phone ? "OrgChart_38-" : "OrgChart_19-") + itemIdentity(partner.shortName, partner.shortName)}>
            <TextField id={phone ? "OrgChart_39" : "OrgChart_20"}>{partner.shortName}</TextField>
          </ContentScope>
          {" ↗"}
        </LinkField>
      ))}
    </div>
  );
}
const OrgChart = () => {
  const { fields } = useContext(Content);
  const entries = getCollection(fields, "board");
  function managed(spec: NodeSpec): NodeSpec {
    if (!entries) return spec;
    const entry = entries.find(member => member.id === spec.id);
    return entry ? {...spec,role:entry.role || spec.role,name:entry.title,bio:entry.body,image:entry.image,hidden:entry.hidden} : {...spec,hidden:true};
  }
  const { data } = useSanityData<LeadershipData>(QUERIES.leadership);
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const president:  NodeSpec = managed({ id: "president",  role: "President",        name: data?.presidentName,         color: "navy"   });
  const secretary:  NodeSpec = managed({ id: "secretary",  role: "Secretary",         name: data?.secretaryName,         color: "gray"   });
  const extVP:      NodeSpec = managed({ id: "ext-vp",     role: "External VP",       name: data?.externalVPName,        color: "gold"   });
  const intVP:      NodeSpec = managed({ id: "int-vp",     role: "Internal VP",       name: data?.internalVPName,        color: "gold"   });
  const bizMgr:     NodeSpec = managed({ id: "biz-mgr",    role: "Business Manager",  name: data?.businessManagerName,   color: "green"  });
  const cec:        NodeSpec = managed({ id: "cec",         role: "Community Engagement Council", name: data?.cecChairName, color: "teal" });
  const advocacy:   NodeSpec = managed({ id: "advocacy",   role: "Advocacy",          name: data?.advocacyChairName,     color: "coral"  });
  const brosDawah:  NodeSpec = managed({ id: "bros-dawah", role: "Brothers Da'wah",   name: data?.brothersDawahChairName, color: "blue"  });
  const sisDawah:   NodeSpec = managed({ id: "sis-dawah",  role: "Sisters Da'wah",    name: data?.sistersDawahChairName, color: "pink"   });
  const brosSocial: NodeSpec = { id: "bros-social",role: "Brothers Social",   name: data?.brothersSocialChairName, color: "purple"};
  const sisSocial:  NodeSpec = managed({ id: "sis-social", role: "Sisters Social",    name: data?.sistersSocialChairName, color: "amber" });
  const marketing:  NodeSpec = managed({ id: "marketing",  role: "Marketing",         name: data?.marketingChairName,    color: "red"    });


  const additional = findAvailable(entries)?.filter(member => !["president","secretary","ext-vp","int-vp","biz-mgr","cec","advocacy","bros-dawah","sis-dawah","bros-social","sis-social","marketing"].includes(member.id)) || [];
  useEffect(() => {
    const wrap = wrapRef.current;
    const svg = svgRef.current;
    if (!wrap || !svg) return;

    const draw = () => {
      const wr = wrap.getBoundingClientRect();
      svg.setAttribute("width", String(wr.width));
      svg.setAttribute("height", String(wr.height));
      svg.innerHTML = "";

      const nodeCenter = (id: string, side: "top" | "bottom") => {
        const el = wrap.querySelector(`[data-node-id="${id}"]`) as HTMLElement | null;
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left - wr.left + r.width / 2, y: side === "top" ? r.top - wr.top : r.top - wr.top + r.height };
      };

      const branchCenter = (id: string, side: "top" | "bottom") => {
        const el = wrap.querySelector(`[data-branch-id="${id}"]`) as HTMLElement | null;
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left - wr.left + r.width / 2, y: side === "top" ? r.top - wr.top : r.top - wr.top + r.height };
      };

      const curve = (
        a: { x: number; y: number } | null,
        b: { x: number; y: number } | null,
        stroke = "#94a3b8",
        opacity = 0.4,
        width = 1.25,
      ) => {
        if (!a || !b) return;
        const my = (a.y + b.y) / 2;
        const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("d", `M ${a.x} ${a.y} C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`);
        p.setAttribute("fill", "none");
        p.setAttribute("stroke", stroke);
        p.setAttribute("stroke-opacity", String(opacity));
        p.setAttribute("stroke-width", String(width));
        p.setAttribute("stroke-linecap", "round");
        svg.appendChild(p);
      };

      const presB = nodeCenter("president", "bottom");
      // President → exec (4 gray lines)
      curve(presB, nodeCenter("secretary", "top"));
      curve(presB, nodeCenter("ext-vp", "top"));
      curve(presB, nodeCenter("int-vp", "top"));
      curve(presB, nodeCenter("biz-mgr", "top"));
      // President → CEC (teal)
      curve(presB, nodeCenter("cec", "top"), "#148066", 0.5, 1.4);
      // External VP → ext branch (one line to the branch box)
      curve(nodeCenter("ext-vp", "bottom"), branchCenter("ext-branch", "top"), "var(--gold-muted)", 0.5);
      // Internal VP → int branch (one line to the branch box)
      curve(nodeCenter("int-vp", "bottom"), branchCenter("int-branch", "top"), "var(--gold-muted)", 0.5);
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    window.addEventListener("resize", draw);
    const t = setTimeout(draw, 120);
    return () => { ro.disconnect(); window.removeEventListener("resize", draw); clearTimeout(t); };
  }, [data, entries]);

  return (
    <div className="w-full">
      {data?.academicYear && (
        <p className="text-center font-body text-[11px] text-muted-foreground/50 mb-7 tracking-[0.22em] uppercase font-semibold">
          <TextField id="OrgChart_3">{data.academicYear}</TextField>
        </p>
      )}

      {!!additional.length && <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-7">
        {additional.map(member => <ContentScope key={member.id} id={"board-" + member.id}>
          <Node spec={{id:member.id,role:member.role || "Board member",name:member.title,bio:member.body,image:member.image,color:"navy"}} />
        </ContentScope>)}
      </div>}
      {/* ── Desktop ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="hidden md:block relative"
        ref={wrapRef}
      >
        <svg ref={svgRef} aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%" }} />

        {/* Row 1 — President */}
        <div className="flex justify-center mb-10">
          <ContentScope id={"board-"+president.id}><Node spec={president} large /></ContentScope>
        </div>

        {/* Row 2 — Exec */}
        <div className="flex justify-center gap-4 lg:gap-6 mb-12 flex-wrap">
          <ContentScope id={"board-"+secretary.id}><Node spec={secretary} /></ContentScope>
          <ContentScope id={"board-"+extVP.id}><Node spec={extVP} /></ContentScope>
          <ContentScope id={"board-"+intVP.id}><Node spec={intVP} /></ContentScope>
          <ContentScope id={"board-"+bizMgr.id}><Node spec={bizMgr} /></ContentScope>
        </div>

        {/* Row 3 — Committees (2-column) */}
        <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-6 items-start">
          {/* External branch */}
          <div
            data-branch-id="ext-branch"
            className="rounded-2xl border border-border/40 bg-background/40 backdrop-blur-sm p-4"
          >
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 text-center mb-3 flex items-center gap-2 justify-center">
              <span className="flex-1 h-px bg-border/40" /><TextField id="OrgChart_9"> External </TextField><span className="flex-1 h-px bg-border/40" />
            </p>
            <div className="flex flex-col gap-2.5">
              <ContentScope id={"board-"+advocacy.id}><Node spec={advocacy} /></ContentScope>
              <ContentScope id={"board-"+brosDawah.id}><Node spec={brosDawah} /></ContentScope>
              <ContentScope id={"board-"+sisDawah.id}><Node spec={sisDawah} /></ContentScope>
            </div>
          </div>

          {/* Internal branch */}
          <div
            data-branch-id="int-branch"
            className="rounded-2xl border border-border/40 bg-background/40 backdrop-blur-sm p-4"
          >
            <p className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 text-center mb-3 flex items-center gap-2 justify-center">
              <span className="flex-1 h-px bg-border/40" /><TextField id="OrgChart_13"> Internal </TextField><span className="flex-1 h-px bg-border/40" />
            </p>
            <div className="flex flex-col gap-2.5">
              <ContentScope id={"board-"+brosSocial.id}><Node spec={brosSocial} /></ContentScope>
              <ContentScope id={"board-"+sisSocial.id}><Node spec={sisSocial} /></ContentScope>
              <ContentScope id={"board-"+marketing.id}><Node spec={marketing} /></ContentScope>
            </div>
          </div>
        </div>

        {/* Row 4 — CEC (full width, centered at bottom) */}
        <div className="flex justify-center">
          <div className="w-full max-w-md flex flex-col items-center gap-3">
            <ContentScope id={"board-"+cec.id}><Node spec={cec} large /></ContentScope>
            <div className="w-full rounded-2xl border border-border/40 bg-background/40 backdrop-blur-sm p-3.5">
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 text-center mb-2.5"><TextField id="OrgChart_18">
                Mosque Partners
              </TextField></p>
              <MosquePartners/>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Mobile — grouped stack ── */}
      <div className="md:hidden flex flex-col gap-3">
        <ContentScope id={"board-"+president.id}><Node spec={president} large /></ContentScope>
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 text-center mt-2 -mb-1"><TextField id="OrgChart_22">Executive Board</TextField></p>
        <ContentScope id={"board-"+secretary.id}><Node spec={secretary} /></ContentScope>
        <ContentScope id={"board-"+extVP.id}><Node spec={extVP} /></ContentScope>
        <ContentScope id={"board-"+intVP.id}><Node spec={intVP} /></ContentScope>
        <ContentScope id={"board-"+bizMgr.id}><Node spec={bizMgr} /></ContentScope>
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 text-center mt-2 -mb-1"><TextField id="OrgChart_27">External</TextField></p>
        <ContentScope id={"board-"+advocacy.id}><Node spec={advocacy} /></ContentScope>
        <ContentScope id={"board-"+brosDawah.id}><Node spec={brosDawah} /></ContentScope>
        <ContentScope id={"board-"+sisDawah.id}><Node spec={sisDawah} /></ContentScope>
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 text-center mt-2 -mb-1"><TextField id="OrgChart_31">Internal</TextField></p>
        <ContentScope id={"board-"+brosSocial.id}><Node spec={brosSocial} /></ContentScope>
        <ContentScope id={"board-"+sisSocial.id}><Node spec={sisSocial} /></ContentScope>
        <ContentScope id={"board-"+marketing.id}><Node spec={marketing} /></ContentScope>
        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 text-center mt-2 -mb-1"><TextField id="OrgChart_35">Community Engagement</TextField></p>
        <ContentScope id={"board-"+cec.id}><Node spec={cec} large /></ContentScope>
        <div className="rounded-2xl border border-border/40 bg-background/40 p-4 -mt-1">
          <p className="font-body text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60 text-center mb-2.5 font-semibold"><TextField id="OrgChart_37">Mosque Partners</TextField></p>
          <MosquePartners phone />
        </div>
      </div>
    </div>
  );
};

export default OrgChart;
