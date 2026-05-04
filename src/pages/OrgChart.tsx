import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import OrgChart from "@/components/OrgChart";
import patternImg from "@/assets/islamic-pattern.jpg";
import { usePageMeta } from "@/lib/usePageMeta";

/**
 * /board — public-facing roster view.
 *
 * The previous version was an editable internal tool that wrote to
 * localStorage and was reachable by direct URL. That's now replaced with a
 * read-only presentation that pulls names from Sanity (single source of
 * truth) via the shared OrgChart component used on /about.
 *
 * If you need the old name-entry workspace back, keep a separate non-public
 * route protected by Vercel Password Protection or move it into Sanity Studio.
 */
const BoardPage = () => {
  usePageMeta({
    title: "Board — MSA at Pitt",
    description: "The 2025–26 MSA at Pitt board. Executive board, committee chairs, and the Community Engagement Council.",
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-28 md:py-36 text-center px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-gold" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
        <BridgeBar />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-5">
            Leadership
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4 px-2 leading-[1.05]">
            MSA <span className="text-gradient-gold inline-block pb-1">Board</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            The students running the show this year.
          </motion.p>
        </div>
      </section>

      <section className="py-10 px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 md:p-10">
            <OrgChart />
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default BoardPage;
