import { motion } from "framer-motion";
import { BookOpen, PartyPopper, HeartHandshake, Globe, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import SectionHeading from "@/components/SectionHeading";
import ArabicVerse from "@/components/ArabicVerse";
import OrgChart from "@/components/OrgChart";
import communityImg from "@/assets/about-community.jpg";
import eventsImg from "@/assets/events-social.jpg";
import patternImg from "@/assets/islamic-pattern.jpg";

const whatWeDo = [
  { icon: BookOpen, title: "Faith & Spirituality", desc: "Weekly Jummah, halaqas, Ramadan programming, and collaborations with the Islamic Center of Pittsburgh.", gradient: "from-[hsl(40,100%,50%)] to-[hsl(45,100%,62%)]" },
  { icon: PartyPopper, title: "Social & Fun", desc: "Eid Socials, TopGolf outings, iftar gatherings of 150+ people, and dedicated brothers' & sisters' events.", gradient: "from-[hsl(153,58%,26%)] to-[hsl(160,50%,40%)]" },
  { icon: HeartHandshake, title: "Support & Resources", desc: "Wellness resources, freshman survival tips, revert resources — we've got your back.", gradient: "from-[hsl(216,50%,10%)] to-[hsl(216,40%,30%)]" },
  { icon: Globe, title: "Community Outreach", desc: "Service projects, volunteering, masjid partnerships, and giving back to Pittsburgh.", gradient: "from-[hsl(38,100%,48%)] to-[hsl(153,58%,26%)]" },
];

const About = () => {
  return (
    <Layout>
      {/* Hero with parallax-style layering */}
      <section className="relative py-32 md:py-44 overflow-hidden">
        <div className="absolute inset-0">
          <img src={eventsImg} alt="MSA outdoor social" className="w-full h-full object-cover" loading="lazy" width={1280} height={720} />
          <div className="absolute inset-0 bg-gradient-to-b from-accent/90 via-accent/60 to-accent/90" />
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Sparkles className="inline text-primary" size={40} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl font-bold text-accent-foreground mb-4"
          >
            We are MSA <span className="text-gradient-gold">at Pitt.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-accent-foreground/70"
          >
            A community rooted in faith, built on belonging, and open to all.
          </motion.p>
        </div>
      </section>

      {/* Mission with decorative gradient border */}
      <section className="section-padding gradient-mesh-warm relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 gold-gradient rounded-full" />
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-arabic text-3xl md:text-4xl text-gradient-gold mb-6"
            dir="rtl"
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </motion.p>
          <SectionHeading title="Our Mission" />
          <p className="text-muted-foreground text-lg leading-relaxed">
            The Muslim Student Association at the University of Pittsburgh exists to foster a welcoming and inclusive community for Muslim students and allies. We strive to strengthen faith, build lasting bonds, celebrate our heritage, and serve those around us — all while making Pitt feel like home.
          </p>
        </div>
      </section>

      {/* Who We Are — enhanced with gradient card */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group"
          >
            {/* Gradient border effect */}
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
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-[var(--radius)] opacity-20 group-hover:opacity-40 transition-opacity blur-sm" />
              <div className="relative glass-card-strong p-5">
                <p className="text-foreground font-semibold text-lg italic">
                  "Whether you've been Muslim your whole life, just took your shahada, or you're just curious — you belong here."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quran Ayat Divider */}
      <section className="section-padding gradient-mesh-gold relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="glass-card-strong glass-glow p-8 md:p-12">
            <ArabicVerse
              arabic="وَاعْتَصِمُوا بِحَبْلِ اللَّهِ جَمِيعًا وَلَا تَفَرَّقُوا"
              translation="And hold firmly to the rope of Allah all together and do not become divided."
              reference="Quran 3:103"
            />
          </div>
        </div>
      </section>

      {/* What We Do — enhanced cards with gradient icons */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
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
        <div className="max-w-3xl mx-auto relative z-10">
          <SectionHeading title="Your MSA Leadership" label="The Board" />
          <OrgChart />
        </div>
      </section>

      {/* Ayat */}
      <section className="section-padding">
        <div className="max-w-3xl mx-auto">
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

export default About;
