import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Role {
  title: string;
  tier: "pres" | "vp" | "chair" | "partner";
  note?: string;
  children?: Role[];
}

const board: Role = {
  title: "President",
  tier: "pres",
  children: [
    {
      title: "External VP",
      tier: "vp",
      children: [
        { title: "Advocacy Chair", tier: "chair" },
        {
          title: "CEC Chair",
          tier: "chair",
          children: [{ title: "ICWP · MAP · Attawheed · ICP · MCCGP", tier: "partner" }],
        },
        { title: "Marketing Chair", tier: "chair" },
      ],
    },
    {
      title: "Brothers VP",
      tier: "vp",
      children: [
        { title: "Social Chair", tier: "chair", note: "& Mentorship" },
        { title: "Dawah Chair", tier: "chair" },
      ],
    },
    {
      title: "Sisters VP",
      tier: "vp",
      children: [
        { title: "Social Chair", tier: "chair", note: "& Mentorship" },
        { title: "Dawah Chair", tier: "chair" },
      ],
    },
    { title: "Treasurer", tier: "vp" },
    {
      title: "Secretary",
      tier: "vp",
      children: [{ title: "Operations Chair", tier: "chair" }],
    },
  ],
};

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
    label: "VP",
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

const Connector = ({ h = "h-4" }: { h?: string }) => (
  <div className={`w-px ${h} bg-gradient-to-b from-border/60 to-border/25 mx-auto`} />
);

/* Desktop node */
const DNode = ({ title, tier, note, delay = 0 }: { title: string; tier: keyof typeof styles; note?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.3 }}
    className={`glass-card border rounded-xl px-3 py-2.5 text-center ${styles[tier].card}`}
  >
    <p className="text-xs font-body font-semibold text-foreground leading-tight mb-1.5">{title}</p>
    <span className={`inline-block text-[9px] font-body font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles[tier].badge}`}>
      {styles[tier].label}
    </span>
    {note && <p className="text-[9px] text-secondary/75 font-medium mt-0.5">{note}</p>}
  </motion.div>
);

const OrgChart = () => {
  const [openVp, setOpenVp] = useState<string | null>(board.children?.[0]?.title ?? null);

  return (
    <div className="glass-card-strong rounded-2xl overflow-hidden">

      {/* ── Mobile accordion ── */}
      <div className="md:hidden p-4 space-y-3">
        {/* President */}
        <div className={`glass-card border rounded-xl px-4 py-3 text-center ${styles.pres.card}`}>
          <p className="font-body font-bold text-foreground text-sm">President</p>
          <span className={`inline-block text-[9px] font-body font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${styles.pres.badge}`}>
            President
          </span>
        </div>

        {/* VP accordion rows */}
        {board.children?.map((vp) => {
          const isOpen = openVp === vp.title;
          return (
            <div key={vp.title} className={`glass-card border rounded-xl overflow-hidden ${styles.vp.card}`}>
              <button
                type="button"
                onClick={() => setOpenVp(isOpen ? null : vp.title)}
                className="w-full flex items-center justify-between px-4 py-3 gap-2 min-h-[52px]"
              >
                <div className="text-left">
                  <p className="font-body text-sm font-semibold text-foreground leading-tight">{vp.title}</p>
                  {vp.children?.length ? (
                    <p className="font-body text-[11px] text-muted-foreground mt-0.5">
                      {vp.children.length} direct report{vp.children.length !== 1 ? "s" : ""}
                    </p>
                  ) : null}
                </div>
                <ChevronDown
                  size={15}
                  className={`flex-shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && vp.children && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 border-t border-border/40 pt-2.5 space-y-2">
                      {vp.children.map((chair) => (
                        <div key={chair.title} className={`rounded-lg border px-3 py-2.5 ${styles.chair.card}`}>
                          <p className="font-body text-xs font-semibold text-foreground">{chair.title}</p>
                          {chair.note && <p className="font-body text-[10px] text-secondary/75 mt-0.5">{chair.note}</p>}
                          {chair.children?.map((sub) => (
                            <p key={sub.title} className="font-body text-[10px] text-muted-foreground mt-1.5 pl-2.5 border-l border-border/50 leading-relaxed">
                              {sub.title}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── Desktop tree ── */}
      <div className="hidden md:block overflow-x-auto">
        <div className="p-6 md:p-8" style={{ minWidth: "720px" }}>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 justify-end mb-8">
            {(["pres", "vp", "chair", "partner"] as const).map((tier) => (
              <span key={tier} className={`inline-flex items-center gap-1.5 text-[10px] font-body font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${styles[tier].badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${styles[tier].dot}`} />
                {styles[tier].label}
              </span>
            ))}
          </div>

          {/* President */}
          <div className="flex justify-center mb-0">
            <div className="w-36">
              <DNode title="President" tier="pres" delay={0} />
            </div>
          </div>
          <Connector h="h-6" />

          {/* Horizontal connector bar */}
          <div className="relative">
            <div className="absolute top-0 left-[7%] right-[7%] h-px bg-border/45" />

            {/* VP columns */}
            <div className="grid grid-cols-5 gap-3 pt-0">
              {board.children!.map((vp, i) => (
                <div key={vp.title} className="flex flex-col items-center">
                  <Connector h="h-6" />
                  <DNode title={vp.title} tier="vp" delay={0.08 + i * 0.05} />

                  {vp.children && vp.children.length > 0 && (
                    <>
                      <Connector h="h-4" />
                      <div className="relative w-full">
                        {vp.children.length > 1 && (
                          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-border/35" />
                        )}
                        <div className={`grid gap-2 pt-0 ${
                          vp.children.length === 1 ? "grid-cols-1" :
                          vp.children.length === 2 ? "grid-cols-2" : "grid-cols-3"
                        }`}>
                          {vp.children.map((chair, j) => (
                            <div key={chair.title} className="flex flex-col items-center">
                              <Connector h="h-4" />
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.18 + i * 0.05 + j * 0.04 }}
                                className={`w-full glass-card border rounded-lg px-2 py-2 text-center ${styles.chair.card}`}
                              >
                                <p className="text-[10px] font-body font-semibold text-foreground leading-tight mb-1">{chair.title}</p>
                                <span className={`inline-block text-[8px] font-body font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${styles.chair.badge}`}>
                                  Chair
                                </span>
                                {chair.note && (
                                  <p className="text-[8px] text-secondary/70 font-medium mt-0.5">{chair.note}</p>
                                )}
                                {chair.children?.map((sub, k) => (
                                  <div key={k} className="mt-1.5">
                                    <Connector h="h-2" />
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      whileInView={{ opacity: 1 }}
                                      viewport={{ once: true }}
                                      transition={{ delay: 0.3 + i * 0.05 + j * 0.04 + k * 0.03 }}
                                      className={`glass-card border rounded-lg px-1.5 py-1.5 text-center ${styles.partner.card}`}
                                    >
                                      <p className="text-[8px] font-body text-muted-foreground leading-tight">{sub.title}</p>
                                    </motion.div>
                                  </div>
                                ))}
                              </motion.div>
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
