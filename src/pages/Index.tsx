import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Users, Moon, HandHeart } from "lucide-react";
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

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="MSA at Pitt community iftar gathering" className="w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-accent/70" />
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '250px' }} />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-[0.25em] text-primary mb-6 font-semibold"
          >
            Muslim Student Association · University of Pittsburgh
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-accent-foreground leading-[1.1] mb-6"
          >
            A Home Away{" "}
            <span className="text-gradient-gold">From Home.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-lg md:text-xl text-accent-foreground/70 max-w-2xl mx-auto mb-10"
          >
            Connecting Muslim students at Pitt through faith, friendship, and service — welcoming everyone, no matter where you're starting from.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/join" className="gold-gradient text-primary-foreground px-8 py-3.5 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity">
              Join the MSA
            </Link>
            <Link to="/events" className="border border-accent-foreground/30 text-accent-foreground px-8 py-3.5 rounded-full font-semibold text-lg hover:bg-accent-foreground/10 transition-colors">
              See Upcoming Events
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-16 z-20 px-4 md:px-8">
        <div className="glass-card max-w-4xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
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
              <p className="font-display text-3xl font-bold text-foreground mt-1">{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Preview */}
      <section className="section-padding max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img src={communityImg} alt="MSA students hanging out on campus" className="rounded-lg shadow-lg w-full object-cover aspect-[4/3]" loading="lazy" width={1280} height={854} />
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
            <ArabicVerse
              arabic="وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ"
              translation="And cooperate in righteousness and piety."
              reference="Quran 5:2"
              className="text-left py-4"
            />
            <Link to="/about" className="text-primary font-semibold hover:underline text-lg">
              Learn more about us →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="section-padding bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="What's coming up" subtitle="Stay connected and never miss a moment." />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GlassCard delay={0}>
              <div className="flex items-center gap-3 mb-4">
                <div className="gold-gradient text-primary-foreground w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm">
                  <span>APR<br/>5</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">MSA TopGolf 2026</h3>
                  <p className="text-muted-foreground text-sm">Sunday · 4–6 PM</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-2">📍 TopGolf Pittsburgh, Bridgeville, PA</p>
              <p className="text-muted-foreground text-sm mb-4">$16.67 for 2 hours of golfing fun. First-timers: +$6. Open to everyone!</p>
              <a href="https://forms.gle/hnUHffFFsyysX7vY6" target="_blank" rel="noopener noreferrer" className="gold-gradient text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold inline-block hover:opacity-90 transition-opacity">
                RSVP →
              </a>
            </GlassCard>
            <GlassCard delay={0.1}>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-secondary text-secondary-foreground w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm">
                  <span>MAR<br/>21</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground">MSA Eid Social 2026</h3>
                  <p className="text-muted-foreground text-sm">Saturday · 1–4 PM</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-2">📍 Schenley Oval, Pittsburgh</p>
              <p className="text-muted-foreground text-sm mb-4">Pizza, Halaqa, Mehndi, Volleyball, Spikeball — celebrate Eid together!</p>
              <span className="text-muted-foreground text-sm font-medium">Past Event</span>
            </GlassCard>
          </div>
          <div className="text-center mt-10">
            <Link to="/events" className="text-primary font-semibold hover:underline text-lg">
              See all events →
            </Link>
          </div>
        </div>
      </section>

      {/* Community Pillars */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="What drives us" label="Our Pillars" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, i) => (
              <GlassCard key={pillar.title} delay={i * 0.1}>
                <pillar.icon className="text-primary mb-4" size={32} />
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{pillar.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Strip */}
      <section className="section-padding bg-muted/50 text-center">
        <SectionHeading title="Follow our story" subtitle="@msa.at.pitt" />
        <a
          href="https://instagram.com/msa.at.pitt"
          target="_blank"
          rel="noopener noreferrer"
          className="gold-gradient text-primary-foreground px-8 py-3 rounded-full font-semibold inline-block hover:opacity-90 transition-opacity"
        >
          Follow us on Instagram →
        </a>
      </section>
    </Layout>
  );
};

export default Index;
