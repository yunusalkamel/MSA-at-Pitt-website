import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES } from "@/lib/sanity";

// ── Sanity leadership shape ───────────────────────────────────────────────────
interface LeadershipData {
  academicYear?: string;
  presidentName?: string;
  internalVPName?: string;
  brothersSocialChairName?: string;
  sistersSocialChairName?: string;
  marketingChairName?: string;
  externalVPName?: string;
  advocacyChairName?: string;
  brothersDawahChairName?: string;
  sistersDawahChairName?: string;
  secretaryName?: string;
  businessManagerName?: string;
}

// ── Visual types (unchanged from original) ────────────────────────────────────
interface Role {
  title: string;
  name?: string;
  tier: "pres" | "vp" | "chair" | "partner";
  note?: string;
  children?: Role[];
}

const styles = {
  pres: {
    card: "border-primary/40 bg-primary/[0.08] shadow-[0_0_18px_hsl(var(--primary)/0.1)]",
    badge: "bg-primary/15 text-primary border border-primary/25",
    dot: "bg-primary",
    label: "President",
  },
  vp: {
    card: "border-secondary/30 bg-secondary/[0.06]",
    badge: "bg-secondary/12 text-secondary border border-secondary/25",
    dot: "bg-secondary",
    label: "Exec Board",
  },
  chair: {
    card: "border-border/55 bg-background/55",
    badge: "bg-muted text-muted-foreground border border-border/40",
    dot: "bg-muted-foreground/35",
    label: "Chair",
  },
  partner: {
    card: "border-border/35 bg-muted/25",
    badge: "bg-muted/50 text-muted-foreground/65 border border-border/25",
    dot: "bg-border",
    label: "Partners",
  },
};

const Connector = ({ h = "h-6" }: { h?: string }) => (
  <div className={`w-px ${h} bg-gradient-to-b from-border/60 to-border/25 mx-auto`} />
);

const DNode = ({
  title,
  tier,
  note,
  name,
  children,
}: Role) => {
  const s = styles[tier];
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative border rounded-xl px-4 py-3 text-center w-44 cursor-default ${s.card}`}
        onClick={() => children?.length && setOpen((v) => !v)}
      >
        {note && (
          <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
            {note}
          </span>
        )}
        <p className="font-body font-semibold text-foreground text-sm leading-snug">{title}</p>
        {name && (
          <p className="font-body text-muted-foreground text-xs mt-0.5 leading-snug">{name}</p>
        )}
        <span className={`inline-block mt-1.5 text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded-full ${s.badge}`}>
          {s.label}
        </span>
        {children?.length ? (
          <ChevronDown
            size={12}
            className={`absolute bottom-2 right-2 text-muted-foreground/40 transition-transform ${open ? "rotate-180" : ""}`}
          />
        ) : null}
      </div>

      {children?.length ? (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col items-center"
            >
              <Connector />
              <div className="flex gap-3 flex-wrap justify-center">
                {children.map((child) => (
                  <div key={child.title} className="flex flex-col items-center">
                    <DNode {...child} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : null}
    </div>
  );
};

// ── Build the tree from Sanity data ───────────────────────────────────────────
function buildTree(d: LeadershipData | null): Role[] {
  const n = (val?: string) => val || undefined; // treat empty string as no name

  return [
    {
      title: "Internal VP",
      name: n(d?.internalVPName),
      tier: "vp",
      children: [
        { title: "Brothers Social Chair", name: n(d?.brothersSocialChairName), tier: "chair" },
        { title: "Sisters Social Chair", name: n(d?.sistersSocialChairName), tier: "chair" },
        { title: "Marketing Chair", name: n(d?.marketingChairName), tier: "chair" },
      ],
    },
    {
      title: "External VP",
      name: n(d?.externalVPName),
      tier: "vp",
      children: [
        { title: "Advocacy Chair", name: n(d?.advocacyChairName), tier: "chair" },
        { title: "Brothers Dawah Chair", name: n(d?.brothersDawahChairName), tier: "chair" },
        { title: "Sisters Dawah Chair", name: n(d?.sistersDawahChairName), tier: "chair" },
      ],
    },
    { title: "Secretary", name: n(d?.secretaryName), tier: "vp" },
    { title: "Business Manager", name: n(d?.businessManagerName), tier: "vp" },
  ];
}

const cec: Role = {
  title: "Community Engagement Council",
  tier: "vp",
  note: "CEC",
  children: [
    { title: "Attawheed · ICWP/MAP · ICP · MCCGP · PGMA", tier: "partner" },
  ],
};

// ── OrgChart component ────────────────────────────────────────────────────────
const OrgChart = () => {
  const { data } = useSanityData<LeadershipData>(QUERIES.leadership);
  const execBoard = buildTree(data);
  const allMobile = [...execBoard, cec];

  return (
    <div className="w-full">
      {data?.academicYear && (
        <p className="text-center font-body text-xs text-muted-foreground/50 mb-6 tracking-widest uppercase">
          {data.academicYear} Board
        </p>
      )}

      {/* Desktop tree */}
      <div className="hidden md:block">
        {/* President */}
        <div className="flex flex-col items-center mb-0">
          <DNode
            title="President"
            name={data?.presidentName || undefined}
            tier="pres"
          />
          <Connector h="h-8" />
        </div>

        {/* Exec board row */}
        <div className="flex justify-center gap-6 flex-wrap">
          {execBoard.map((role) => (
            <DNode key={role.title} {...role} />
          ))}
        </div>

        {/* CEC */}
        <div className="flex flex-col items-center mt-8">
          <Connector />
          <DNode {...cec} />
        </div>
      </div>

      {/* Mobile accordion */}
      <div className="md:hidden flex flex-col gap-3">
        <DNode
          title="President"
          name={data?.presidentName || undefined}
          tier="pres"
        />
        {allMobile.map((role) => (
          <DNode key={role.title} {...role} />
        ))}
      </div>
    </div>
  );
};

export default OrgChart;
