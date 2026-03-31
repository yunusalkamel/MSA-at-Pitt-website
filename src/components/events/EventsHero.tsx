import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import patternImg from "@/assets/islamic-pattern.jpg";

const EventsHero = () => (
  <section className="relative py-28 md:py-36 text-center px-4 overflow-hidden">
    <div className="absolute inset-0 bg-accent" />
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/40 to-accent" />
    {/* Decorative orbs */}
    <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-[100px]" />
    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-secondary/10 blur-[100px]" />

    <div className="relative z-10 max-w-3xl mx-auto">
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
    </div>
  </section>
);

export default EventsHero;
