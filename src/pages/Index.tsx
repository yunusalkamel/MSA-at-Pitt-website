import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Heart, Users, Moon, HandHeart, Instagram } from "lucide-react";
import { useRef } from "react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import SectionHeading from "@/components/SectionHeading";
import ArabicVerse from "@/components/ArabicVerse";
import heroImg from "@/assets/hero-gathering.jpg";
import communityImg from "@/assets/about-community.jpg";
import patternImg from "@/assets/islamic-pattern.jpg";

const pillars = [
  { icon: Moon, title: "Faith", desc: "Weekly Jummah, halaqas, Ramadan programming — nourishing your connection with Allah on a college campus." },
  { icon: Users, title: "Brotherhood & Sisterhood", desc: "Lifelong bonds formed through dedicated brothers' and sisters' programming and shared everyday experiences." },
  { icon: Heart, title: "Community", desc: "Iftars, socials, TopGolf, sports — we show up for each other on and off campus." },
  { icon: HandHeart, title: "Service", desc: "Outreach, volunteering, and giving back to Pittsburgh and beyond." },
];

function useSectionParallax(ref: React.RefObject<HTMLElement | null>, amount = 14) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return useTransform(scrollYProgress, [0, 1], [`-${amount}px`, `${amount}px`]);
}

const Index = () => {
  const heroRef = useRef<HTMLElement>(null);
  const communityRef = useRef<HTMLElement>(null);
  const pillarsRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "32%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.75], [1, 0]);

  const communityBgY = useSectionParallax(communityRef, 14);
  const pillarsBgY = useSectionParallax(pillarsRef, 10);

  return (
    <Layout>
      {/* ── Hero ── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0 parallax-layer" style={{ y: heroY }}>
          <img
            src={heroImg}
            alt="MSA at Pitt community gathering"
            className="w-full h-full object-cover scale-110"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-accent/85 via-accent/55 to-accent/95" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '280px' }} />
        </motion.div>

        {/* Ambient orbs */}
        <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/5 w-72 h-72 rounded-full bg-secondary/8 blur-[120px]" />

        <motion.div
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
          style={{ opacity: heroOpacity }}
        >
          {/* Bismillah — intentional design element, not a header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="mb-8 flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-3 w-40">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-1 h-1 rounded-full bg-primary/60" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
            </div>
            <p
              className="font-arabic text-2xl md:text-3xl text-primary/80 tracking-wide"
              dir="rtl"
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <div className="flex items-center gap-3 w-40">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-1 h-1 rounded-full bg-primary/60" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
            </div>
          </motion.div>

          {/* Org identity first */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-xs uppercase tracking-[0.3em] text-primary/90 mb-5 font-semibold"
          >
            Muslim Student Association · University of Pittsburgh
          </motion.p>

          {/* The headline — dominant visual element */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.7 }}
            className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-accent-foreground leading-[1.0] mb-7 tracking-tight"
          >
            A Home Away
            <br />
            <span className="text-gradient-gold italic">From Home.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="text-base md:text-lg text-accent-foreground/65 max-w-xl mx-auto mb-10 leading-relaxed font-light"
          >
            Connecting Muslim students at Pitt through faith, friendship, and service.
            Everyone is welcome — wherever you're starting from.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/join" className="btn-premium text-base px-8 py-3.5">
              Join the MSA <ArrowRight size={16} />
            </Link>
            <Link to="/events" className="btn-premium-secondary text-base px-8 py-3.5">
              See Upcoming Events
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-primary/40 to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative z-20 px-4 md:px-8 -mt-14">
        <div className="glass-card-strong glass-glow max-w-3xl mx-auto p-6 md:p-8 grid grid-cols-3 gap-0">
          {[
            { label: "Weekly Events", value: "10+", sub: "every semester" },
            { label: "Active Members", value: "200+", sub: "and growing" },
            { label: "Years at Pitt", value: "20+", sub: "established" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`text-center px-4 ${i < 2 ? "border-r border-border/50" : ""}`}
            >
              <p className="font-display text-4xl md:text-5xl font-bold text-gradient-gold leading-none">{stat.value}</p>
              <p className="text-foreground text-sm font-semibold mt-1.5">{stat.label}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Our Story ── */}
      <section ref={communityRef} className="section-padding warm-surface relative overflow-hidden">
        <motion.div className="absolute inset-0 gradient-mesh-warm" style={{ y: communityBgY }} />
        <div className="absolute inset-0 texture-cross" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-secondary/15 to-primary/20 rounded-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 blur-sm" />
              <div className="relative glass-card p-3">
                <img
                  src={communityImg}
                  alt="MSA students hanging out on campus"
                  className="rounded-xl w-full object-cover aspect-[4/3]"
                  loading="lazy"
                  width={1280}
                  height={854}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.15 }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4">Our Story</p>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                More than<br />a club.
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                MSA at Pitt is one of the largest and most vibrant student organizations at the University of Pittsburgh. We're a community rooted in Islamic values, built on real friendships, and open to absolutely everyone — Muslim or not, practicing or not, just curious or deeply committed.
              </p>
              <div className="glass-card-strong p-5 mb-7 border-l-2 border-primary/30">
                <ArabicVerse
                  arabic="وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ"
                  translation="And cooperate in righteousness and piety."
                  reference="Quran 5:2"
                  className="text-left py-0"
                />
              </div>
              <Link to="/about" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-200 text-base">
                Learn more about us <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="glass-divider-thick" />

      {/* ── Upcoming Events ── */}
      <section className="section-padding warm-surface-deep relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-gold" />
        <div className="absolute inset-0 texture-dots" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading
            title="What's coming up"
            subtitle="Stay connected and never miss a moment."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <GlassCard delay={0}>
              <div className="flex items-start gap-4 mb-4">
                <div className="gold-gradient text-primary-foreground w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-xs flex-shrink-0 shadow-md">
                  <span className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">Apr</span>
                  <span className="font-display text-2xl font-bold leading-none">5</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground leading-tight">MSA TopGolf 2026</h3>
                  <p className="text-muted-foreground text-sm mt-0.5">Sunday · 4–6 PM</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-1.5">📍 TopGolf Pittsburgh, Bridgeville</p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">$16.67 for 2 hours of golfing. First-timers: +$6. Open to everyone!</p>
              <a href="https://forms.gle/hnUHffFFsyysX7vY6" target="_blank" rel="noopener noreferrer" className="btn-premium text-sm px-5 py-2">
                RSVP <ArrowRight size={13} />
              </a>
            </GlassCard>

            <GlassCard delay={0.1}>
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-secondary text-secondary-foreground w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-xs flex-shrink-0 shadow-md">
                  <span className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">Apr</span>
                  <span className="font-display text-2xl font-bold leading-none">19</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground leading-tight">MSA Annual Banquet 2026</h3>
                  <p className="text-muted-foreground text-sm mt-0.5">Saturday · 6–10 PM</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-1.5">📍 University Club, University of Pittsburgh</p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">Our flagship gala — keynote speaker, dinner, awards, and a night to remember.</p>
              <a href="https://forms.gle/hnUHffFFsyysX7vY6" target="_blank" rel="noopener noreferrer" className="btn-premium text-sm px-5 py-2">
                RSVP <ArrowRight size={13} />
              </a>
            </GlassCard>

            {/* See all card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card border-dashed flex flex-col items-center justify-center p-8 text-center min-h-[220px] hover:border-primary/30 transition-colors group"
            >
              <p className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">See all events</p>
              <p className="text-muted-foreground text-sm mb-5">Halaqas, speakers, sisters' events, and more.</p>
              <Link to="/events" className="btn-premium-secondary text-sm px-5 py-2">
                View Full Calendar <ArrowRight size={13} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Pillars ── */}
      <section ref={pillarsRef} className="section-padding warm-surface relative overflow-hidden">
        <motion.div className="absolute inset-0 gradient-mesh-warm" style={{ y: pillarsBgY }} />
        <div className="absolute inset-0 texture-lines opacity-50" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeading title="What drives us" label="Our Pillars" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((pillar, i) => (
              <GlassCard key={pillar.title} delay={i * 0.08}>
                <div className="gold-gradient w-11 h-11 rounded-xl flex items-center justify-center mb-5 shadow-sm">
                  <pillar.icon className="text-primary-foreground" size={20} />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-tight">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{pillar.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Join CTA — dedicated conversion section ── */}
      <section className="section-padding gradient-section-gold-soft relative overflow-hidden">
        <div className="absolute inset-0 texture-dots" />
        <div className="absolute top-0 left-0 right-0 h-px glass-divider" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-4">Get Involved</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-5 leading-tight">
              Ready to find<br />
              <span className="text-gradient-gold italic">your people?</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              Join 200+ students who've made MSA their home at Pitt. Whether you're a freshman figuring things out or a senior looking to give back — there's a place for you here.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/join" className="btn-premium text-base px-8 py-3.5">
                Get Started <ArrowRight size={16} />
              </Link>
              <a
                href="https://instagram.com/msa.at.pitt"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium-secondary text-base px-8 py-3.5"
              >
                <Instagram size={16} /> Follow @msa.at.pitt
              </a>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px glass-divider" />
      </section>

      {/* ── Closing Ayat ── */}
      <section className="section-padding-sm gradient-section-emerald-soft relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="glass-card-strong glass-glow p-8 md:p-12">
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

export default Index;
