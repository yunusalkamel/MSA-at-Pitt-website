import { Picture, ContentScope, TextField, itemIdentity, CardCopies } from "@/editor/content";
import { motion } from "framer-motion";
import { BookOpen, PartyPopper, HeartHandshake, Globe, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import SectionHeading from "@/components/SectionHeading";
import SectionDivider from "@/components/SectionDivider";
import ArabicVerse from "@/components/ArabicVerse";
import OrgChart from "@/components/OrgChart";
import BridgeBar from "@/components/BridgeBar";
import { usePageMeta } from "@/lib/usePageMeta";
import communityImg from "@/assets/about-community-1024.webp";
import communityMobileImg from "@/assets/about-community-640.webp";
import eventsImg from "@/assets/events-social-1280.webp";
import eventsMobileImg from "@/assets/events-social-768.webp";
import patternImg from "@/assets/islamic-pattern-360.webp";

const communityCards = [
  { icon: PartyPopper, title: "Social & Fun", desc: "Eid Socials, TopGolf outings, iftar gatherings of 150+ people, and dedicated brothers' & sisters' events.", gradient: "from-[#0A5C46] to-[#148066]" },
  { icon: HeartHandshake, title: "Support & Resources", desc: "Wellness resources, freshman survival tips, revert resources — we've got your back.", gradient: "from-[#14345A] to-[#11233C]" },
];
const imanCards = [
  { icon: BookOpen, title: "Faith & Spirituality", desc: "Weekly Jummah, halaqas, Ramadan programming, and collaborations with the Islamic Center of Pittsburgh.", gradient: "from-[#F2AB23] to-[#C9A84C]" },
  { icon: Globe, title: "Service & Da'wah", desc: "Service projects, volunteering, masjid partnerships, and giving back to Pittsburgh.", gradient: "from-[#8A6212] to-[#148066]" },
];

const About = () => {
  usePageMeta({
    title: "About — MSA at Pitt",
    description: "We host the prayer space, organize the iftars, run the halaqas, and put on the events that fill the year. Founded 1997.",
  });
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <div className="absolute inset-0">
          <Picture fieldId="About_1" src={eventsImg} srcSet={`${eventsMobileImg} 768w, ${eventsImg} 1280w`} sizes="100vw" alt="MSA outdoor social" className="w-full h-full object-cover scale-105" loading="eager" width={1280} height={720} />
          <div className="absolute inset-0 bg-gradient-to-b from-accent/90 via-accent/60 to-accent/90" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
          <BridgeBar />
        </div>

        {/* Crescent removed — kept only on a couple of secondary surfaces per spec */}

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6"
          >
            <Sparkles className="inline text-primary" size={44} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.6 }}
            className="font-display text-5xl font-bold text-accent-foreground mb-4 md:text-7xl tracking-tight"
          ><TextField id="About_3">
            We're the MSA </TextField><span className="text-gradient-gold italic inline-block pb-1"><TextField id="About_4">at Pitt.</TextField></span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="text-lg md:text-xl text-accent-foreground/65 font-light"
          ><TextField id="About_5">
            A community rooted in faith, built on belonging, and open to all.
          </TextField></motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs uppercase tracking-[0.25em] text-primary/70 font-body font-semibold mt-4"
          ><TextField id="About_6">
            Cultivate Community, Ignite Iman.
          </TextField></motion.p>
        </div>
      </section>

      {/* Mission + Who We Are — same topic, no divider needed */}
      <section className="section-padding gradient-mesh-warm relative overflow-hidden">
        <div className="absolute inset-0 texture-dots pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 gold-gradient rounded-full" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Bismillah + Mission — centered intro */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-6 flex flex-col items-center gap-2"
            >
              <div className="flex items-center gap-3 w-40">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/35" />
                <div className="w-1 h-1 rounded-full bg-primary/50" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/35" />
              </div>
              <p className="font-arabic text-3xl md:text-4xl text-gradient-gold inline-block pb-2" dir="rtl"><TextField id="About_7">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </TextField></p>
              <div className="flex items-center gap-3 w-40">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/35" />
                <div className="w-1 h-1 rounded-full bg-primary/50" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/35" />
              </div>
            </motion.div>

            <ContentScope id="About_8"><SectionHeading title="Our Mission" /></ContentScope>
            <p className="font-dm-sans text-muted-foreground text-lg leading-relaxed"><TextField id="About_9">
              MSA at Pitt is the spiritual and social home for Muslim students at the University of Pittsburgh. We host the prayer space, organize the iftars, run the halaqas, and put on the events that fill the year — so faith, friendship, and service feel like the default of college life, not the exception.
            </TextField></p>
          </div>

          {/* Who We Are — 2-col reveal */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary via-secondary to-primary rounded-3xl opacity-30 group-hover:opacity-45 transition-opacity duration-500 blur-sm" />
              <div className="relative glass-card p-3">
                <Picture fieldId="About_10" src={communityImg} srcSet={`${communityMobileImg} 640w, ${communityImg} 1024w`} sizes="(max-width: 767px) 92vw, 570px" alt="MSA community" className="rounded-2xl w-full object-cover aspect-[4/3]" loading="lazy" width={1280} height={854} />
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.55 }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6"><TextField id="About_11">
                Who We </TextField><span className="text-gradient-gold inline-block pb-1"><TextField id="About_12">Are</TextField></span>
              </h2>
              <p className="font-dm-sans text-muted-foreground text-lg leading-relaxed mb-4"><TextField id="About_13">
                MSA at Pitt is one of the University of Pittsburgh's largest and most active student organizations. We host everything from weekly halaqas and Friday Jummah to TopGolf outings, Eid celebrations, and iftars that fill entire halls.
              </TextField></p>
              <p className="font-dm-sans text-muted-foreground text-lg leading-relaxed mb-4"><TextField id="About_14">
                Our events draw hundreds of students each semester — and we mean it when we say everyone is welcome.
              </TextField></p>
              <div className="relative group mt-6">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-[var(--radius)] opacity-20 group-hover:opacity-35 transition-opacity duration-500 blur-sm" />
                <div className="relative liquid-glass rounded-[var(--radius)] p-5">
                  <p className="font-display text-foreground font-semibold text-lg italic leading-relaxed"><TextField id="About_15">
                    "Whether you've been Muslim your whole life, just took your shahada, or you're just curious — you belong here."
                  </TextField></p>
                </div>
              </div>
              <div className="liquid-glass p-4 mt-4 border-l-2 border-primary/30">
                <p className="text-sm text-foreground italic leading-relaxed"><TextField id="About_16">
                  "A man is upon the religion of his best friend, so let one of you look at whom he befriends."
                </TextField></p>
                <p className="text-xs text-muted-foreground mt-1"><TextField id="About_17">— Prophet Muhammad ﷺ (Sunan al-Tirmidhi 2378)</TextField></p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Topic change: Mission → What We Do */}
      <SectionDivider />

      {/* What We Do */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 steps-surface pointer-events-none" />
        <div className="absolute inset-0 texture-dots opacity-50 pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-96 h-64 rounded-full bg-secondary/[0.06] blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ContentScope id="About_18"><SectionHeading title="What We Do" label="Our Focus Areas" /></ContentScope>
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            {/* Left — Cultivate Community */}
            <div>
              <p className="font-display italic text-gradient-gold inline-block pb-1 text-xl mb-6 tracking-wide"><TextField id="About_19">Cultivate Community.</TextField></p>
              <div className="grid sm:grid-cols-2 gap-5">
                {communityCards.map((item, i) => (
                  <CardCopies key={item.title} id={"About_20-" + itemIdentity(item, item.title)}><GlassCard key={item.title} delay={i * 0.08}>
                    <div className={`bg-gradient-to-br ${item.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                      <item.icon className="text-white" size={24} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-2"><TextField id="About_21">{item.title}</TextField></h3>
                    <p className="font-satoshi text-muted-foreground text-sm leading-relaxed"><TextField id="About_22">{item.desc}</TextField></p>
                  </GlassCard></CardCopies>
                ))}
              </div>
            </div>
            {/* Right — Ignite Iman */}
            <div>
              <p className="font-display italic text-gradient-aura inline-block pb-1 text-xl mb-6 tracking-wide"><TextField id="About_23">Ignite Iman.</TextField></p>
              <div className="grid sm:grid-cols-2 gap-5">
                {imanCards.map((item, i) => (
                  <CardCopies key={item.title} id={"About_24-" + itemIdentity(item, item.title)}><GlassCard key={item.title} delay={0.16 + i * 0.08}>
                    <div className={`bg-gradient-to-br ${item.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                      <item.icon className="text-white" size={24} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-2"><TextField id="About_25">{item.title}</TextField></h3>
                    <p className="font-satoshi text-muted-foreground text-sm leading-relaxed"><TextField id="About_26">{item.desc}</TextField></p>
                  </GlassCard></CardCopies>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Topic change: Focus areas → Leadership */}
      <SectionDivider />

      {/* Leadership */}
      <section className="section-padding gradient-mesh-warm relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <ContentScope id="About_27"><SectionHeading title="Your MSA Leadership" label="The Board" /></ContentScope>
          <OrgChart />
        </div>
      </section>

      {/* Topic change: Leadership → Closing */}
      <SectionDivider />

      {/* Closing — 49:13 (peoples and tribes meeting one another) fits About */}
      <section className="section-padding-sm gradient-section-gold-soft">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card-strong glass-glow p-8 md:p-12">
            <ContentScope id="About_28"><ArabicVerse
              arabic="يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا"
              translation="O mankind, We created you from male and female and made you peoples and tribes that you may know one another."
              reference="Quran 49:13"
            /></ContentScope>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
