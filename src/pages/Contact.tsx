import { motion } from "framer-motion";
import { Mail, BookOpen, MessageSquare, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";
import { LINKS } from "@/config/links";
import { usePageMeta } from "@/lib/usePageMeta";

const ImamCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45, delay: 0.1 }}
    className="glass-card-strong rounded-2xl p-7 flex flex-col gap-5"
  >
    <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center flex-shrink-0">
      <BookOpen size={22} className="text-secondary" />
    </div>
    <div>
      <p className="eyebrow text-jannah-mid dark:text-msa-gold/70 mb-1">Spiritual Guidance</p>
      <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-tight">Imam Muhammad Patel</h3>
      <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-3">
        For Islamic counseling, naseeha, or personal guidance — Imam Patel is available to all students.
      </p>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 font-body">
        <span className="font-semibold text-foreground/70">Office hours:</span>
        Tuesday & Thursday, 4:00–6:00 PM
      </div>
    </div>
    <div className="flex flex-col gap-2 mt-auto">
      <a href="mailto:imam@pitt.edu" className="btn-premium-secondary text-sm px-5 py-2.5 justify-center">
        <Mail size={14} /> Email Imam Patel
      </a>
      <span className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-body font-semibold text-sm text-muted-foreground bg-muted/60 border border-border/50 cursor-default">
        Book a Meeting — Coming Soon
      </span>
    </div>
  </motion.div>
);

const Contact = () => {
  usePageMeta({
    title: "Contact — MSA at Pitt",
    description: "Get in touch with MSA at Pitt leadership, Imam Patel, or leave anonymous feedback.",
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 md:py-44 overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 gradient-mesh-warm" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '220px' }} />
          <BridgeBar />
          <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-secondary/8 blur-[80px]" />
        </div>

        <div className="relative z-10 px-4 max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-body text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-5"
          >
            Get In Touch
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight"
          >
            We read every message,{" "}
            <span className="text-gradient-gold italic">insha'Allah.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="font-dm-sans text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Whether you have a question, need support, or just want to say salam — we're here.
          </motion.p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="section-padding warm-surface relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-warm" />
        <div className="absolute inset-0 texture-dots opacity-40 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">

            {/* Card 1 — General inquiries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="glass-card-strong rounded-2xl p-7 flex flex-col gap-5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Mail size={22} className="text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-tight">Say Salam</h3>
                <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed">
                  For general questions, event info, or anything else — reach out anytime.
                </p>
              </div>
              <div className="flex flex-col gap-2 mt-auto">
                <a href={`mailto:${LINKS.email}`} className="btn-premium text-sm px-5 py-2.5 justify-center">
                  Email us <ArrowRight size={14} />
                </a>
                <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer"
                  className="btn-premium-secondary text-sm px-5 py-2.5 justify-center">
                  Instagram DM <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>

            {/* Card 2 — Imam Patel */}
            <ImamCard />

            {/* Card 3 — Anonymous feedback */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="glass-card-strong rounded-2xl p-7 flex flex-col gap-5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={22} className="text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-tight">Share Your Thoughts</h3>
                <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed">
                  Have feedback for the board? We genuinely read every response. Completely anonymous, no login required.
                </p>
              </div>
              <div className="mt-auto">
                <a href={LINKS.anonymousFeedback} target="_blank" rel="noopener noreferrer"
                  className="btn-premium text-sm px-5 py-2.5 w-full justify-center">
                  Leave Feedback <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
          </div>

          <p className="text-center text-xs text-muted-foreground/60 font-body mt-8">
            For media or partnership inquiries, please email{" "}
            <a href={`mailto:${LINKS.email}`} className="text-primary hover:underline">{LINKS.email}</a>
          </p>
        </div>
      </section>

      {/* Closing ayat */}
      <section className="section-padding-sm gradient-section-emerald-soft">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-7">
            <ArabicVerse
              arabic="إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ"
              translation="The believers are but brothers."
              reference="Quran 49:10"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
