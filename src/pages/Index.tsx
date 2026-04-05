import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, Users, Moon, HandHeart } from "lucide-react";
import { useRef } from "react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import SectionHeading from "@/components/SectionHeading";
import ArabicVerse from "@/components/ArabicVerse";
import heroImg from "@/assets/hero-gathering.jpg";
import communityImg from "@/assets/about-community.jpg";
import patternImg from "@/assets/islamic-pattern.jpg";

const pillars = [
  { icon: Moon, title: "Faith", desc: "Islamic education, spiritual growth, and weekly Jummah to nourish your connection with Allah." },
  { icon: Users, title: "Brotherhood & Sisterhood", desc: "Lifelong bonds formed through brothers' and sisters' programming and shared experiences." },
  { icon: Heart, title: "Community", desc: "Iftars, socials, TopGolf, sports — we show up for each other on and off campus." },
  { icon: HandHeart, title: "Service", desc: "Outreach, volunteering, and giving back to Pittsburgh and beyond." },
];

// Reusable hook for mid-page section parallax
function useSectionParallax(ref: React.RefObject<HTMLElement | null>, amount = 12) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return useTransform(scrollYProgress, [0, 1], [`-${amount}px`, `${amount}px`]);
}

const Index = () => {
  const heroRef = useRef<HTMLElement>(null);
  const communityRef = useRef<HTMLElement>(null);
  const pillarsRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  const communityBgY = useSectionParallax(communityRef, 16);
  const pillarsBgY = useSectionParallax(pillarsRef, 10);

  return (
    <Layout>
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <img src={heroImg} alt="MSA at Pitt community iftar gathering" className="w-full h-full object-cover scale-110" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-accent/80 via-accent/50 to-accent/90" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '250px' }} />
        </motion.div>
        <div className="absolute top-1/4 left-1/6 w-80 h-80 rounded-full bg-primary/15 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/5 w-64 h-64 rounded-full bg-secondary/10 blur-[100px]" />
        <motion.div className="relative z-10 text-center px-4 max-w-4xl mx-auto" style={{ opacity: heroOpacity }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="font-arabic text-2xl md:text-3xl text-primary/90 mb-8"
            dir="rtl"
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xs uppercase tracking-[0.25em] text-primary mb-6 font-semibold"
          >
            Muslim Student Association · University of Pittsburgh
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-accent-foreground leading-[1.1] mb-6"
          >
            A Home Away{" "}
            <span className="text-gradient-gold">From Home.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-lg md:text-xl text-accent-foreground/70 max-w-2xl mx-auto mb-10"
          >
            Connecting Muslim students at Pitt through faith, friendship, and service — welcoming everyone, no matter where you're starting from.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/join" className="btn-premium text-lg px-8 py-3.5">Join the MSA</Link>
            <Link to="/events" className="btn-premium-secondary text-lg px-8 py-3.5">See Upcoming Events</Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar — lifted above next section with a clean shadow, no negative margin overlap */}
      <section className="relative z-20 px-4 md:px-8 -mt-12">
        <div className="glass-card-strong glass-glow max-w-4xl mx-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { emoji: "🕌", label: "Weekly Events", value: "10+" },
            { emoji: "🤝", label: "Active Members", value: "200+" },
            { emoji: "📍", label: "Years at Pitt", value: "20+" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <span className="text-2xl">{stat.emoji}</span>
              <p className="font-display text-3xl font-bold text-gradient-gold mt-1">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Preview — mid-section parallax on bg */}
      <section ref={communityRef} className="section-padding warm-surface relative overflow-hidden">
        <motion.div className="absolute inset-0 gradient-mesh-warm" style={{ y: communityBgY }} />
        <div className="absolute inset-0 texture-cross" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="glass-card p-3"
            >
              <img src={communityImg} alt="MSA students hanging out on campus" className="rounded-2xl w-full object-cover aspect-[4/3]" loading="lazy" width={1280} height={854} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">More than a club.</h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                MSA at Pitt is one of the largest and most vibrant student organizations at the University of Pittsburgh. We're a community rooted in Islamic values, built on real friendships, and open to absolutely everyone — Muslim or not, practicing or not, just curious or deeply committed.
              </p>
              <div className="glass-card-strong p-5 mb-6">
                <ArabicVerse
                  arabic="وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ"
                  translation="And cooperate in righteousness and piety."
                  reference="Quran 5:2"
                  className="text-left py-0"
                />
              </div>
              <Link to="/about" className="text-primary font-semibold hover:underline text-lg">
                Learn more about us →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="glass-divider-thick max-w-2xl mx-auto" />

      {/* Upcoming Events */}
      <section className="section-padding warm-surface-deep relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-gold" />
        <div className="absolute inset-0 texture-dots" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading title="What's coming up" subtitle="Stay connected and never miss a moment." />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassCard delay={0}>
              <div className="flex items-center gap-3 mb-4">
                <div className="gold-gradient text-primary-foreground w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm shadow-md">
                  <span>APR<br />5</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">MSA TopGolf 2026</h3>
                  <p className="text-muted-foreground text-sm">Sunday · 4–6 PM</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-2">📍 TopGolf Pittsburgh, Bridgeville, PA</p>
              <p className="text-muted-foreground text-sm mb-4">$16.67 for 2 hours of golfing fun. First-timers: +$6. Open to everyone!</p>
              <a href="https://forms.gle/hnUHffFFsyysX7vY6" target="_blank" rel="noopener noreferrer" className="btn-premium text-sm px-5 py-2">
                RSVP →
              </a>
            </GlassCard>
            <GlassCard delay={0.1}>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-secondary text-secondary-foreground w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm shadow-md">
                  <span>APR<br />19</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">MSA Annual Banquet 2026</h3>
                  <p className="text-muted-foreground text-sm">Saturday · 6–10 PM</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-2">📍 University Club, University of Pittsburgh</p>
              <p className="text-muted-foreground text-sm mb-4">Our flagship gala — keynote speaker, dinner, awards, and a night to remember.</p>
              <a href="https://forms.gle/hnUHffFFsyysX7vY6" target="_blank" rel="noopener noreferrer" className="btn-premium text-sm px-5 py-2">
                RSVP →
              </a>
            </GlassCard>
          </div>
          <div className="text-center mt-10">
            <Link to="/events" className="text-primary font-semibold hover:underline text-lg">
              See all events →
            </Link>
          </div>
        </div>
      </section>

      {/* Quran Ayat */}
      <section className="section-padding gradient-section-emerald-soft relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-secondary/[0.08] blur-[120px]" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="glass-card-strong glass-glow p-8 md:p-12">
            <ArabicVerse
              arabic="إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ"
              translation="The believers are but brothers."
              reference="Quran 49:10"
            />
          </div>
        </div>
      </section>

      {/* Community Pillars — mid-section parallax */}
      <section ref={pillarsRef} className="section-padding warm-surface relative overflow-hidden">
        <motion.div className="absolute inset-0 gradient-mesh-warm" style={{ y: pillarsBgY }} />
        <div className="absolute inset-0 texture-lines opacity-40" />
        <div className="absolute bottom-1/4 left-1/5 w-72 h-72 rounded-full bg-primary/[0.08] blur-[100px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading title="What drives us" label="Our Pillars" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, i) => (
              <GlassCard key={pillar.title} delay={i * 0.1}>
                <div className="gold-gradient w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <pillar.icon className="text-primary-foreground" size={24} />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{pillar.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Strip */}
      <section className="section-padding text-center warm-surface-deep relative overflow-hidden">
        <div className="absolute inset-0 gradient-section-gold-soft" />
        <div className="absolute inset-0 texture-dots" />
        <div className="relative z-10">
          <SectionHeading title="Follow our story" subtitle="@msa.at.pitt" />
          <a href="https://instagram.com/msa.at.pitt" target="_blank" rel="noopener noreferrer" className="btn-premium px-8 py-3">
            Follow us on Instagram →
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
