import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BookOpen, PartyPopper, HeartHandshake, Globe, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import SectionHeading from "@/components/SectionHeading";
import ArabicVerse from "@/components/ArabicVerse";
import OrgChart from "@/components/OrgChart";
import CrescentWatermark from "@/components/CrescentWatermark";
import BridgeBar from "@/components/BridgeBar";
import communityImg from "@/assets/about-community.jpg";
import eventsImg from "@/assets/events-social.jpg";
import patternImg from "@/assets/islamic-pattern.jpg";

const whatWeDo = [
  { icon: BookOpen, title: "Faith & Spirituality", desc: "Weekly Jummah, halaqas, Ramadan programming, and collaborations with the Islamic Center of Pittsburgh.", gradient: "from-[#F2AB23] to-[#C9A84C]" },
  { icon: PartyPopper, title: "Social & Fun", desc: "Eid Socials, TopGolf outings, iftar gatherings of 150+ people, and dedicated brothers' & sisters' events.", gradient: "from-[#0A5C46] to-[#148066]" },
  { icon: HeartHandshake, title: "Support & Resources", desc: "Wellness resources, freshman survival tips, revert resources — we've got your back.", gradient: "from-[#14345A] to-[#11233C]" },
  { icon: Globe, title: "Community Outreach", desc: "Service projects, volunteering, masjid partnerships, and giving back to Pittsburgh.", gradient: "from-[#8A6212] to-[#148066]" },
];

const About = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroBgY = useTransform(heroScroll, [0, 1], ["0%", "28%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  return (
    <Layout>
      {/* Hero with parallax bg image */}
      <section ref={heroRef} className="relative py-32 md:py-44 overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroBgY }}>
          <img src={eventsImg} alt="MSA outdoor social" className="w-full h-full object-cover scale-110" loading="lazy" width={1280} height={720} />
          <div className="absolute inset-0 bg-gradient-to-b from-accent/90 via-accent/60 to-accent/90" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />

          <BridgeBar />
        </motion.div>
        {/* Crescent watermark */}
        <CrescentWatermark color="#F2AB23" size={280} opacity={0.04} position="right" />

        <motion.div
          className="relative z-10 text-center px-4 max-w-3xl mx-auto"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.4, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mb-6"
          >
            <Sparkles className="inline text-primary" size={44} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="font-display text-5xl font-bold text-accent-foreground mb-4 md:text-7xl tracking-tight"
          >
            We are MSA <span className="text-gradient-gold italic">at Pitt.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="text-lg md:text-xl text-accent-foreground/65 font-light"
          >
            A community rooted in faith, built on belonging, and open to all.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs uppercase tracking-[0.25em] text-primary/70 font-semibold mt-4"
          >
            Cultivate Community, Ignite Iman.
          </motion.p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="section-padding gradient-mesh-warm relative overflow-hidden">
        <div className="absolute inset-0 texture-dots" />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 gold-gradient rounded-full" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0 }}
            className="mb-6 flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-3 w-40">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/35" />
              <div className="w-1 h-1 rounded-full bg-primary/50" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/35" />
            </div>
            <p
              className="font-arabic text-3xl md:text-4xl text-gradient-gold"
              dir="rtl"
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <div className="flex items-center gap-3 w-40">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/35" />
              <div className="w-1 h-1 rounded-full bg-primary/50" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/35" />
            </div>
          </motion.div>
          <SectionHeading title="Our Mission" />
          <p className="text-muted-foreground text-lg leading-relaxed">
            The Muslim Student Association at the University of Pittsburgh exists to foster a welcoming and inclusive community for Muslim students and allies. We strive to strengthen faith, build lasting bonds, celebrate our heritage, and serve those around us — all while making Pitt feel like home.
          </p>
        </div>
      </section>

      <div className="glass-divider-thick max-w-3xl mx-auto" />

      {/* Who We Are */}
      <section className="section-padding gradient-section-gold-soft relative overflow-hidden">
        <div className="absolute inset-0 texture-lines" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-primary via-secondary to-primary rounded-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 blur-sm" />
            <div className="relative glass-card p-3">
              <img src={communityImg} alt="MSA community" className="rounded-2xl w-full object-cover aspect-[4/3]" loading="lazy" width={1280} height={854} />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Who We <span className="text-gradient-gold">Are</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              MSA at Pitt is one of the University of Pittsburgh's largest and most active student organizations. We host everything from weekly halaqas and Friday Jummah to TopGolf outings, Eid celebrations, and iftars that fill entire halls.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              Our events draw hundreds of students each semester — and we mean it when we say everyone is welcome.
            </p>
            <div className="relative group mt-6">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-[var(--radius)] opacity-20 group-hover:opacity-35 transition-opacity duration-500 blur-sm" />
              <div className="relative liquid-glass rounded-[var(--radius)] p-5">
                <p className="text-foreground font-semibold text-lg italic leading-relaxed">
                  "Whether you've been Muslim your whole life, just took your shahada, or you're just curious — you belong here."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What We Do */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 steps-surface" />
        <div className="absolute inset-0 texture-dots opacity-50" />

        <div className="absolute top-0 left-1/3 w-96 h-64 rounded-full bg-secondary/[0.06] blur-[100px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading title="What We Do" label="Our Focus Areas" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whatWeDo.map((item, i) => (
              <GlassCard key={item.title} delay={i * 0.1}>
                <div className={`bg-gradient-to-br ${item.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <item.icon className="text-white" size={24} />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Org Chart */}
      <section className="section-padding gradient-mesh-warm relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />

        <div className="max-w-5xl mx-auto relative z-10">
          <SectionHeading title="Your MSA Leadership" label="The Board" />
          <OrgChart />
        </div>
      </section>

      {/* Closing Ayat — one, relevant to the org's mission */}
      <section className="section-padding-sm gradient-section-gold-soft">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card-strong glass-glow p-8 md:p-12">
            <ArabicVerse
              arabic="وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا"
              translation="And hold firmly to the rope of Allah all together and do not become divided."
              reference="Quran 3:103"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
