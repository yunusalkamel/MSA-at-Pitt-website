import { PageHero } from "@/components/PageHero";
import { Picture, TextField } from "@/editor/content";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { communityPhoto } from "@/data/communityPhotos";
import BridgeBar from "@/components/BridgeBar";

const EventsHero = () => {
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], prefersReduced ? ["0%", "0%"] : ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], prefersReduced ? [1, 1] : [1, 0]);

  return (
    <PageHero ref={ref} className="relative text-center overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-accent" />
        <Picture fieldId="events-hall" src={communityPhoto("banquet").src} alt="Tables filled with students at an MSA banquet" sizes="100vw" width={1280} height={600} className="absolute inset-0 h-full w-full object-cover object-center" />
        <BridgeBar />
        <div className="absolute inset-0 bg-gradient-to-b from-accent/50 via-accent/70 to-accent/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(20,128,102,.15)_0%,transparent_55%)]" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-secondary/10 blur-[100px]" />
      </motion.div>

      <motion.div
        className="relative z-10 max-w-3xl mx-auto"
        style={{ opacity: contentOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="page-hero-kicker"
        >
          <Sparkles className="inline text-primary" size={16} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-display text-5xl md:text-7xl font-bold text-accent-foreground mb-5 px-2 leading-[1.05]"
        ><TextField id="EventsHero_2">
          Our </TextField><span className="text-gradient-gold inline-block pb-2"><TextField id="EventsHero_3">Events</TextField></span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-lg md:text-xl text-accent-foreground/70 max-w-xl mx-auto leading-relaxed"
        ><TextField id="EventsHero_4">
          From halaqas to banquets, iftars to socials — find your next moment with the community.
        </TextField></motion.p>
      </motion.div>
    </PageHero>
  );
};

export default EventsHero;
