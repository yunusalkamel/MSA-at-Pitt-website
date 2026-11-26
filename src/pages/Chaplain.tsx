import { PageHero } from "@/components/PageHero";
import { Picture, LinkField } from "@/editor/content";
import { ContentScope, TextField, itemIdentity, CardCopies } from "@/editor/content";
import { motion } from "framer-motion";
import { Clock, Mail, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import SectionDivider from "@/components/SectionDivider";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/geometric-tile.svg";

const Chaplain = () => (
  <Layout>
    {/* ── Hero ─────────────────────────────────────────────────── */}
    <PageHero className="relative text-center overflow-hidden">
      <div className="absolute inset-0 gradient-mesh-gold" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
      <BridgeBar />
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-5"><TextField id="Chaplain_2">
          Resources
        </TextField></motion.p>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4"><TextField id="Chaplain_3">
          University </TextField><span className="text-gradient-gold inline-block pb-1"><TextField id="Chaplain_4">Chaplain</TextField></span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed"><TextField id="Chaplain_5">
          Spiritual guidance, Islamic counseling, and support for every student at Pitt.
        </TextField></motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-6">
          <Link to="/resources" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={14} /><TextField id="Chaplain_6"> Back to Resources
          </TextField></Link>
        </motion.div>
      </div>
    </PageHero>

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
            <div className="flex items-center justify-center bg-secondary/5 p-4 md:p-5">
              <Picture fieldId="Chaplain_portrait" src="/photos/prayer/imam-muhammad-patel.webp" alt="Imam Muhammad Patel" width={720} height={916} loading="lazy" className="block w-40 md:w-full h-auto rounded-md" />
            </div>

            {/* Info */}
            <div className="p-6 md:p-8">
              <div className="mb-1">
                <span className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-primary/70"><TextField id="Chaplain_9">University Imam &amp; Chaplain</TextField></span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1"><TextField id="Chaplain_10">Imam Muhammad Patel</TextField></h3>
              <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-5"><TextField id="Chaplain_11">
                Born in Blackburn, England to a Gujarati family, Imam Muhammad Patel memorized the Quran at age 15. He completed his Alim program and has led Tarawih prayers in Rome and Boynton Beach. He specializes in teaching children with learning challenges — bringing patience, warmth, and deep knowledge to every interaction.
              </TextField></p>
              <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-6"><TextField id="Chaplain_12">
                At MSA at Pitt, Imam Patel assists with Jummah, tabling, Islamic counseling, naseeha, marketing, halaqahs, and leading prayers. He is a resource for any student seeking guidance — whether related to faith, personal struggles, or navigating college life as a Muslim.
              </TextField></p>

              <div className="flex items-start gap-3 rounded-xl bg-primary/[0.06] border border-primary/15 px-4 py-3 mb-5">
                <Clock size={15} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-body font-semibold text-foreground text-sm"><TextField id="Chaplain_13">Office Hours</TextField></p>
                  <p className="font-body text-muted-foreground text-sm mt-0.5"><TextField id="Chaplain_14">Monday 5–6 PM after his halaqah · Friday 3–4 PM</TextField></p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <LinkField fieldId="Chaplain_destination_1"
                  href="mailto:imam@pitt.edu"
                  className="inline-flex items-center gap-2 btn-premium-secondary text-sm px-4 py-2"
                  aria-label="Email Imam Muhammad Patel"
                >
                  <Mail size={14} /><TextField id="Chaplain_15"> Email
                </TextField></LinkField>
                <span
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-body font-semibold text-muted-foreground bg-muted/60 border border-border/50 cursor-default"
                  title="Booking link coming soon"
                >
                  <ExternalLink size={14} /><TextField id="Chaplain_16"> Book a Meeting — Coming Soon
                </TextField></span>
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
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6"><TextField id="Chaplain_17">How Imam Patel Can Help</TextField></h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { emoji: "🤲", title: "Islamic Counseling", desc: "Personal guidance grounded in Islamic values for any life challenge." },
            { emoji: "📖", title: "Naseeha & Halaqahs", desc: "One-on-one advice and leading weekly Islamic study circles." },
            { emoji: "🕌", title: "Jummah & Prayers", desc: "Leading and coordinating Jummah and daily prayer at MSA events." },
            { emoji: "🌙", title: "Ramadan Programs", desc: "Tarawih leadership, iftar coordination, and Ramadan spiritual support." },
            { emoji: "💬", title: "New Muslims", desc: "Patient support for reverts and those exploring Islam for the first time." },
            { emoji: "📚", title: "Quran & Islamic Ed.", desc: "Quran recitation guidance and introductory Islamic education." },
          ].map((item) => (
            <CardCopies key={item.title} id={"Chaplain_18-" + itemIdentity(item, item.title)}><motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="liquid-glass-hover p-5 rounded-2xl"
            >
              <span className="text-2xl block mb-3"><TextField id="Chaplain_19">{item.emoji}</TextField></span>
              <h3 className="font-display text-base font-bold text-foreground mb-1"><TextField id="Chaplain_20">{item.title}</TextField></h3>
              <p className="font-dm-sans text-muted-foreground text-xs leading-relaxed"><TextField id="Chaplain_21">{item.desc}</TextField></p>
            </motion.div></CardCopies>
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
          <ContentScope id="Chaplain_22"><ArabicVerse
            arabic="وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ"
            translation="And remind, for indeed reminding benefits the believers."
            reference="Quran 51:55"
          /></ContentScope>
        </div>
      </div>
    </section>
  </Layout>
);

export default Chaplain;
