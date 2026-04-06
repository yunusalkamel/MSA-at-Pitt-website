import { motion } from "framer-motion";

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

const roleStyles: Record<NodeData["role"], { card: string; dot: string; label: string; labelText: string }> = {
  pres: {
    card: "border-primary/40 bg-primary/[0.07] shadow-[0_0_20px_hsl(var(--primary)/0.12)]",
    dot: "bg-primary",
    label: "bg-primary/15 text-primary border border-primary/25",
    labelText: "President",
  },
  vp: {
    card: "border-secondary/30 bg-secondary/[0.06]",
    dot: "bg-secondary",
    label: "bg-secondary/12 text-secondary border border-secondary/25",
    labelText: "VP",
  },
  chair: {
    card: "border-border/60 bg-background/60",
    dot: "bg-muted-foreground/40",
    label: "bg-muted text-muted-foreground border border-border/40",
    labelText: "Chair",
  },
  sub: {
    card: "border-border/40 bg-muted/30",
    dot: "bg-border",
    label: "bg-muted/50 text-muted-foreground/70 border border-border/30",
    labelText: "Org",
  },
};

const OrgNode = ({
  node,
  index = 0,
  depth = 0,
  isLast = false,
}: {
  node: NodeData;
  index?: number;
  depth?: number;
  isLast?: boolean;
}) => {
  const styles = roleStyles[node.role];
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center relative">
      {/* Node card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: depth * 0.08 + index * 0.04, duration: 0.4 }}
        className={`relative glass-card border rounded-xl px-3 py-2.5 text-center min-w-[90px] max-w-[130px] ${styles.card}`}
      >
        <p className="font-body text-[11px] md:text-xs font-semibold text-foreground leading-tight mb-1">
          {node.title}
        </p>
        <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${styles.label}`}>
          {styles.labelText}
        </span>
        {node.note && (
          <p className="text-[9px] text-secondary/80 font-medium mt-1">{node.note}</p>
        )}
      </motion.div>

      {/* Connector line down */}
      {hasChildren && (
        <div className="w-px h-5 bg-gradient-to-b from-border to-border/50" />
      )}

      {/* Children row */}
      {hasChildren && (
        <div className="relative flex gap-2 md:gap-3 items-start">
          {/* Horizontal bar spanning all children */}
          {node.children!.length > 1 && (
            <div
              className="absolute top-0 left-0 right-0 h-px bg-border/60"
              style={{ top: 0 }}
            />
          )}

          {node.children!.map((child, i) => (
            <div key={`${child.title}-${i}`} className="flex flex-col items-center">
              {/* Vertical drop to each child */}
              <div className="w-px h-5 bg-border/60" />
              <OrgNode
                node={child}
                index={i}
                depth={depth + 1}
                isLast={i === node.children!.length - 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Top level: President centered, then VP row, then chairs beneath each VP
const OrgChart = () => {
  return (
    <div className="glass-card-strong p-6 md:p-10 overflow-x-auto">
      <div className="min-w-[640px]">

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-end mb-8">
          {(["pres", "vp", "chair", "sub"] as const).map((role) => (
            <span
              key={role}
              className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${roleStyles[role].label}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${roleStyles[role].dot}`} />
              {roleStyles[role].labelText}
            </span>
          ))}
        </div>

        {/* President */}
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className={`glass-card border rounded-xl px-5 py-3 text-center ${roleStyles.pres.card}`}
          >
            <p className="font-display text-base font-bold text-foreground mb-1">President</p>
            <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${roleStyles.pres.label}`}>
              President
            </span>
          </motion.div>

          {/* Connector down */}
          <div className="w-px h-6 bg-gradient-to-b from-primary/30 to-border/40" />

          {/* Horizontal bar */}
          <div className="relative w-full flex justify-center">
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-border/50" />
          </div>

          {/* VP row */}
          <div className="flex gap-4 md:gap-6 items-start pt-0">
            {orgData.children!.map((vp, i) => (
              <div key={`${vp.title}-${i}`} className="flex flex-col items-center">
                <div className="w-px h-6 bg-border/50" />

                {/* VP node */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                  className={`glass-card border rounded-xl px-3 py-2.5 text-center min-w-[88px] max-w-[120px] ${roleStyles.vp.card}`}
                >
                  <p className="font-body text-[11px] md:text-xs font-semibold text-foreground leading-tight mb-1">
                    {vp.title}
                  </p>
                  <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${roleStyles.vp.label}`}>
                    VP
                  </span>
                </motion.div>

                {/* Chairs beneath VP */}
                {vp.children && vp.children.length > 0 && (
                  <>
                    <div className="w-px h-4 bg-border/40" />
                    <div className="relative flex gap-2 items-start">
                      {vp.children.length > 1 && (
                        <div className="absolute top-0 left-0 right-0 h-px bg-border/40" />
                      )}
                      {vp.children.map((chair, j) => (
                        <div key={`${chair.title}-${j}`} className="flex flex-col items-center">
                          <div className="w-px h-4 bg-border/40" />
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + i * 0.06 + j * 0.04, duration: 0.35 }}
                            className={`glass-card border rounded-lg px-2.5 py-2 text-center min-w-[76px] max-w-[110px] ${roleStyles.chair.card}`}
                          >
                            <p className="font-body text-[10px] font-semibold text-foreground leading-tight mb-1">
                              {chair.title}
                            </p>
                            <span className={`inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${roleStyles.chair.label}`}>
                              Chair
                            </span>
                            {chair.note && (
                              <p className="text-[8px] text-secondary/70 font-medium mt-0.5">{chair.note}</p>
                            )}
                            {/* Sub-orgs */}
                            {chair.children && chair.children.map((sub, k) => (
                              <div key={k} className="flex flex-col items-center mt-1.5">
                                <div className="w-px h-3 bg-border/30" />
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  whileInView={{ opacity: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: 0.35 + i * 0.06 + j * 0.04 + k * 0.03 }}
                                  className={`glass-card border rounded-lg px-2 py-1.5 text-center max-w-[105px] ${roleStyles.sub.card}`}
                                >
                                  <p className="font-body text-[9px] text-muted-foreground leading-tight">
                                    {sub.title}
                                  </p>
                                </motion.div>
                              </div>
                            ))}
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgChart;
