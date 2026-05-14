import { motion } from "framer-motion";
import { Clock, Mail, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import SectionDivider from "@/components/SectionDivider";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";

const Chaplain = () => (
  <Layout>
    {/* ── Hero ─────────────────────────────────────────────────── */}
    <section className="relative py-28 md:py-36 text-center px-4 overflow-hidden">
      <div className="absolute inset-0 gradient-mesh-gold" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
      <BridgeBar />
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-5">
          Resources
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4">
          University <span className="text-gradient-gold inline-block pb-1">Chaplain</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
          Spiritual guidance, Islamic counseling, and support for every student at Pitt.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-6">
          <Link to="/resources" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={14} /> Back to Resources
          </Link>
        </motion.div>
      </div>
    </section>

    {/* ── Chaplain bio ─────────────────────────────────────────── */}
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 steps-surface pointer-events-none" />
      <div className="absolute inset-0 texture-dots opacity-40 pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card-strong rounded-2xl overflow-hidden"
        >
          <div className="grid md:grid-cols-[280px_1fr] gap-0">
            {/* Photo placeholder */}
            <div className="relative bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center min-h-[280px] md:min-h-full">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "150px" }} />
              <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/25 flex items-center justify-center">
                  <span className="font-display text-3xl font-bold text-primary/50">MP</span>
                </div>
                <p className="font-body text-xs text-muted-foreground/60 italic">Photo coming soon</p>
              </div>
            </div>

            {/* Info */}
            <div className="p-6 md:p-8">
              <div className="mb-1">
                <span className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-primary/70">University Imam &amp; Chaplain</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">Imam Muhammad Patel</h3>
              <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-5">
                Born in Blackburn, England to a Gujarati family, Imam Muhammad Patel memorized the Quran at age 15. He completed his Alim program and has led Tarawih prayers in Rome and Boynton Beach. He specializes in teaching children with learning challenges — bringing patience, warmth, and deep knowledge to every interaction.
              </p>
              <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-6">
                At MSA at Pitt, Imam Patel assists with Jummah, tabling, Islamic counseling, naseeha, marketing, halaqahs, and leading prayers. He is a resource for any student seeking guidance — whether related to faith, personal struggles, or navigating college life as a Muslim.
              </p>

              <div className="flex items-start gap-3 rounded-xl bg-primary/[0.06] border border-primary/15 px-4 py-3 mb-5">
                <Clock size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-foreground text-sm">Office Hours</p>
                  <p className="font-body text-muted-foreground text-sm mt-0.5">Tuesday &amp; Thursday, 4:00 – 6:00 PM</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:imam@pitt.edu"
                  className="inline-flex items-center gap-2 btn-premium-secondary text-sm px-4 py-2"
                  aria-label="Email Imam Muhammad Patel"
                >
                  <Mail size={14} /> Email
                </a>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-body font-semibold text-muted-foreground bg-muted/60 border border-border/50 cursor-default"
                  title="Booking link coming soon"
                >
                  <ExternalLink size={14} /> Book a Meeting — Coming Soon
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>

    <SectionDivider />

    {/* ── What the chaplain can help with ─────────────────────── */}
    <section className="section-padding gradient-section-gold-soft relative overflow-hidden">
      <div className="absolute inset-0 texture-dots opacity-40 pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">How Imam Patel Can Help</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { emoji: "🤲", title: "Islamic Counseling", desc: "Personal guidance grounded in Islamic values for any life challenge." },
            { emoji: "📖", title: "Naseeha & Halaqahs", desc: "One-on-one advice and leading weekly Islamic study circles." },
            { emoji: "🕌", title: "Jummah & Prayers", desc: "Leading and coordinating Jummah and daily prayer at MSA events." },
            { emoji: "🌙", title: "Ramadan Programs", desc: "Tarawih leadership, iftar coordination, and Ramadan spiritual support." },
            { emoji: "💬", title: "New Muslims", desc: "Patient support for reverts and those exploring Islam for the first time." },
            { emoji: "📚", title: "Quran & Islamic Ed.", desc: "Quran recitation guidance and introductory Islamic education." },
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="liquid-glass-hover p-5 rounded-2xl"
            >
              <span className="text-2xl block mb-3">{item.emoji}</span>
              <h3 className="font-display text-base font-bold text-foreground mb-1">{item.title}</h3>
              <p className="font-dm-sans text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <SectionDivider />

    {/* ── Closing verse ────────────────────────────────────────── */}
    <section className="section-padding-sm gradient-section-gold-soft relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="glass-card-strong glass-glow p-8">
          <ArabicVerse
            arabic="وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ"
            translation="And remind, for indeed reminding benefits the believers."
            reference="Quran 51:55"
          />
        </div>
      </div>
    </section>
  </Layout>
);

export default Chaplain;
