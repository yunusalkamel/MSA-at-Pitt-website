import { motion } from "framer-motion";

type Role = "pres" | "vp" | "chair" | "sub";

interface OrgNode {
  title: string;
  role: Role;
  note?: string;
  children?: OrgNode[];
}

const orgData: OrgNode = {
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
          children: [
            { title: "ICWP/MAP · Attawheed · ICP · MCCGP", role: "sub" },
          ],
        },
        { title: "Marketing Chair", role: "chair" },
      ],
    },
    {
      title: "Brothers VP",
      role: "vp",
      children: [
        { title: "Social Chair", role: "chair", note: "+ mentorship embed → reports to VP" },
        { title: "Dawah Chair", role: "chair" },
      ],
    },
    {
      title: "Sisters VP",
      role: "vp",
      children: [
        { title: "Social Chair", role: "chair", note: "+ mentorship embed → reports to VP" },
        { title: "Dawah Chair", role: "chair" },
      ],
    },
    { title: "Treasurer", role: "vp" },
    {
      title: "Secretary",
      role: "vp",
      children: [
        { title: "Operations Chair", role: "chair" },
      ],
    },
  ],
};

const roleBadgeClasses: Record<Role, string> = {
  pres: "bg-primary text-primary-foreground",
  vp: "bg-secondary text-secondary-foreground",
  chair: "bg-muted text-foreground",
  sub: "bg-border text-muted-foreground",
};

const roleLabels: Record<Role, string> = {
  pres: "Pres",
  vp: "VP",
  chair: "Chair",
  sub: "Sub",
};

const OrgNode = ({ node, depth = 0 }: { node: OrgNode; depth?: number }) => (
  <div className={depth > 0 ? "ml-6 md:ml-10 border-l border-primary/20 pl-4 md:pl-6" : ""}>
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: depth * 0.05 }}
      className="flex flex-wrap items-center gap-2 py-2"
    >
      <span className="font-display font-semibold text-foreground text-sm md:text-base">
        {node.title}
      </span>
      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${roleBadgeClasses[node.role]}`}>
        {roleLabels[node.role]}
      </span>
      {node.note && (
        <span className="text-xs text-secondary font-medium bg-secondary/10 px-2.5 py-0.5 rounded-full">
          {node.note}
        </span>
      )}
    </motion.div>
    {node.children?.map((child, i) => (
      <OrgNode key={`${child.title}-${i}`} node={child} depth={depth + 1} />
    ))}
  </div>
);

const OrgChart = () => (
  <div className="glass-card-strong p-6 md:p-10">
    <OrgNode node={orgData} />
  </div>
);

export default OrgChart;
