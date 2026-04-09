import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles } from "lucide-react";
import patternImg from "@/assets/islamic-pattern.jpg";
import CrescentWatermark from "@/components/CrescentWatermark";
import BridgeBar from "@/components/BridgeBar";

const EventsHero = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative py-28 md:py-36 text-center px-4 overflow-hidden">
      {/* Parallax background layers */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-accent" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }}
        />

        <BridgeBar />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/40 to-accent" />
        {/* Jannah atmospheric glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(20,128,102,.15)_0%,transparent_55%)]" />
        {/* Decorative orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-secondary/10 blur-[100px]" />
      </motion.div>
      {/* Crescent watermark */}
      <CrescentWatermark color="#F2AB23" size={260} opacity={0.04} position="right" />

      <motion.div
        className="relative z-10 max-w-3xl mx-auto"
        style={{ opacity: contentOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-5"
        >
          <Sparkles className="inline text-primary" size={36} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-5xl md:text-7xl font-bold text-accent-foreground mb-5"
        >
          Our <span className="text-gradient-gold">Events</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-lg md:text-xl text-accent-foreground/70 max-w-xl mx-auto leading-relaxed"
        >
          From halaqas to banquets, iftars to socials — find your next moment with
          the community.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default EventsHero;
