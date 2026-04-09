import { motion } from "framer-motion";
import { useState } from "react";

interface NodeData {
  title: string;
  role: "pres" | "vp" | "chair" | "sub";
  note?: string;
  children?: NodeData[];
}

const orgData: NodeData = {
  title: "President",
  role: "pres",
  children: [
    {
      title: "External VP",
      role: "vp",
      children: [
        { title: "Advocacy Chair", role: "chair" },
        {
          title: "CEC Chair",
          role: "chair",
          children: [{ title: "ICWP · MAP · Attawheed · ICP · MCCGP", role: "sub" }],
        },
        { title: "Marketing Chair", role: "chair" },
      ],
    },
    {
      title: "Brothers VP",
      role: "vp",
      children: [
        { title: "Social Chair", role: "chair", note: "+ Mentorship" },
        { title: "Dawah Chair", role: "chair" },
      ],
    },
    {
      title: "Sisters VP",
      role: "vp",
      children: [
        { title: "Social Chair", role: "chair", note: "+ Mentorship" },
        { title: "Dawah Chair", role: "chair" },
      ],
    },
    { title: "Treasurer", role: "vp" },
    {
      title: "Secretary",
      role: "vp",
      children: [{ title: "Operations Chair", role: "chair" }],
    },
  ],
};

const roleStyles = {
  pres: {
    card: "border-primary/40 bg-primary/[0.07] shadow-[0_0_20px_hsl(var(--primary)/0.12)]",
    dot: "bg-primary",
    badge: "bg-primary/15 text-primary border border-primary/25",
  },
  vp: {
    card: "border-secondary/30 bg-secondary/[0.06]",
    dot: "bg-secondary",
    badge: "bg-secondary/12 text-secondary border border-secondary/25",
  },
  chair: {
    card: "border-border/60 bg-background/60",
    dot: "bg-muted-foreground/40",
    badge: "bg-muted text-muted-foreground border border-border/40",
  },
  sub: {
    card: "border-border/40 bg-muted/30",
    dot: "bg-border",
    badge: "bg-muted/50 text-muted-foreground/70 border border-border/30",
  },
};

const roleLabels = { pres: "President", vp: "VP", chair: "Chair", sub: "Partner Org" };

const Node = ({
  title, role, note, delay = 0,
}: {
  title: string; role: keyof typeof roleStyles; note?: string; delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.35 }}
    className={`glass-card border rounded-xl px-3 py-2.5 text-center ${roleStyles[role].card}`}
  >
    <p className="text-xs font-semibold text-foreground leading-tight mb-1.5">{title}</p>
    <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${roleStyles[role].badge}`}>
      {roleLabels[role]}
    </span>
    {note && <p className="text-[9px] text-secondary/80 font-medium mt-1">{note}</p>}
  </motion.div>
);

const Connector = ({ height = "h-4" }: { height?: string }) => (
  <div className={`w-px ${height} bg-gradient-to-b from-border to-border/40 mx-auto`} />
);

const OrgChart = () => {
  const [openVp, setOpenVp] = useState<string | null>(orgData.children?.[0]?.title ?? null);

  return (
    <div className="glass-card-strong rounded-2xl">
      {/* Mobile: stacked accordion/list */}
      <div className="md:hidden p-4">
        <div className="mb-4">
          <Node title="President" role="pres" />
        </div>
        <div className="grid gap-2">
          {orgData.children?.map((vp) => {
            const isOpen = openVp === vp.title;
            return (
              <div key={vp.title} className="glass-card border border-border/50 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenVp(isOpen ? null : vp.title)}
                  className="w-full text-left px-3.5 py-3 min-h-11"
                >
                  <p className="text-sm font-semibold text-foreground leading-tight">{vp.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {vp.children?.length ? `${vp.children.length} role${vp.children.length === 1 ? "" : "s"}` : "No sub-roles"}
                  </p>
                </button>
                {isOpen && vp.children && (
                  <div className="px-3.5 pb-3">
                    <div className="border-t border-border/40 pt-2.5 grid gap-2">
                      {vp.children.map((chair) => (
                        <div key={chair.title} className={`rounded-lg border px-3 py-2 ${roleStyles.chair.card}`}>
                          <p className="text-xs font-semibold text-foreground leading-tight">{chair.title}</p>
                          {chair.note && <p className="text-[11px] text-secondary/80 mt-0.5">{chair.note}</p>}
                          {chair.children?.map((sub) => (
                            <p key={sub.title} className="text-[11px] text-muted-foreground mt-1.5 pl-2 border-l border-border/50">
                              {sub.title}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: full chart layout */}
      <div className="hidden md:block overflow-x-auto">
        <div className="p-6 md:p-8" style={{ minWidth: "700px" }}>
      {/* Legend */}
          <div className="flex flex-wrap gap-2 justify-end mb-8">
            {(["pres", "vp", "chair", "sub"] as const).map((role) => (
              <span key={role} className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${roleStyles[role].badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${roleStyles[role].dot}`} />
                {roleLabels[role]}
              </span>
            ))}
          </div>

          {/* President */}
          <div className="flex justify-center mb-0">
            <div className="w-36">
              <Node title="President" role="pres" delay={0} />
            </div>
          </div>
          <Connector height="h-6" />

          {/* Horizontal bar across VP columns */}
          <div className="relative">
            <div className="absolute top-0 left-[7%] right-[7%] h-px bg-border/50" />

            {/* VP row */}
            <div className="grid grid-cols-5 gap-3 pt-0">
              {orgData.children!.map((vp, i) => (
                <div key={vp.title} className="flex flex-col items-center">
                  <Connector height="h-6" />
                  <Node title={vp.title} role="vp" delay={0.1 + i * 0.05} />

              {/* Chairs */}
                  {vp.children && vp.children.length > 0 && (
                    <>
                      <Connector height="h-4" />
                      <div className="relative w-full">
                        {vp.children.length > 1 && (
                          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-border/40" />
                        )}
                        <div className={`grid gap-2 pt-0 ${
                          vp.children.length === 1 ? "grid-cols-1" :
                          vp.children.length === 2 ? "grid-cols-2" : "grid-cols-3"
                        }`}>
                          {vp.children.map((chair, j) => (
                            <div key={chair.title} className="flex flex-col items-center">
                              <Connector height="h-4" />
                              <div className="w-full">
                                <motion.div
                                  initial={{ opacity: 0, y: 8 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: 0.2 + i * 0.05 + j * 0.04 }}
                                  className={`glass-card border rounded-lg px-2 py-2 text-center ${roleStyles.chair.card}`}
                                >
                                  <p className="text-[10px] font-semibold text-foreground leading-tight mb-1">{chair.title}</p>
                                  <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${roleStyles.chair.badge}`}>
                                    Chair
                                  </span>
                                  {chair.note && (
                                    <p className="text-[8px] text-secondary/70 font-medium mt-0.5">{chair.note}</p>
                                  )}
                                  {chair.children?.map((sub, k) => (
                                    <div key={k} className="mt-1.5">
                                      <Connector height="h-2" />
                                      <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.35 + i * 0.05 + j * 0.04 + k * 0.03 }}
                                        className={`glass-card border rounded-lg px-1.5 py-1.5 text-center ${roleStyles.sub.card}`}
                                      >
                                        <p className="text-[8px] text-muted-foreground leading-tight">{sub.title}</p>
                                      </motion.div>
                                    </div>
                                  ))}
                                </motion.div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgChart;
