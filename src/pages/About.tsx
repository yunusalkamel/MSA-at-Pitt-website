import { motion } from "framer-motion";
import { BookOpen, PartyPopper, HeartHandshake, Globe } from "lucide-react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import SectionHeading from "@/components/SectionHeading";
import ArabicVerse from "@/components/ArabicVerse";
import OrgChart from "@/components/OrgChart";
import communityImg from "@/assets/about-community.jpg";
import eventsImg from "@/assets/events-social.jpg";

const whatWeDo = [
  { icon: BookOpen, title: "Faith & Spirituality", desc: "Weekly Jummah, halaqas, Ramadan programming, and collaborations with the Islamic Center of Pittsburgh." },
  { icon: PartyPopper, title: "Social & Fun", desc: "Eid Socials, TopGolf outings, iftar gatherings of 150+ people, and dedicated brothers' & sisters' events." },
  { icon: HeartHandshake, title: "Support & Resources", desc: "Wellness resources, freshman survival tips, revert resources — we've got your back." },
  { icon: Globe, title: "Community Outreach", desc: "Service projects, volunteering, masjid partnerships, and giving back to Pittsburgh." },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        <div className="absolute inset-0">
          <img src={eventsImg} alt="MSA outdoor social" className="w-full h-full object-cover" loading="lazy" width={1280} height={720} />
          <div className="absolute inset-0 bg-gradient-to-b from-accent/80 via-accent/60 to-accent/80" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
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

      {/* Mission */}
      <section className="section-padding gradient-mesh-warm">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-arabic text-3xl md:text-4xl text-primary/80 mb-6" dir="rtl">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <SectionHeading title="Our Mission" />
          <p className="text-muted-foreground text-lg leading-relaxed">
            The Muslim Student Association at the University of Pittsburgh exists to foster a welcoming and inclusive community for Muslim students and allies. We strive to strengthen faith, build lasting bonds, celebrate our heritage, and serve those around us — all while making Pitt feel like home.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-3"
          >
            <img src={communityImg} alt="MSA community" className="rounded-2xl w-full object-cover aspect-[4/3]" loading="lazy" width={1280} height={854} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">Who We Are</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              MSA at Pitt is one of the University of Pittsburgh's largest and most active student organizations. We host everything from weekly halaqas and Friday Jummah to TopGolf outings, Eid celebrations, and iftars that fill entire halls.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              Our events draw hundreds of students each semester — and we mean it when we say everyone is welcome.
            </p>
            <div className="glass-card p-5">
              <p className="text-foreground font-semibold text-lg italic">
                "Whether you've been Muslim your whole life, just took your shahada, or you're just curious — you belong here."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quran Ayat Divider */}
      <section className="section-padding gradient-mesh-gold">
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

      {/* What We Do */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="What We Do" label="Our Focus Areas" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whatWeDo.map((item, i) => (
              <GlassCard key={item.title} delay={i * 0.1}>
                <div className="gold-gradient w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md">
                  <item.icon className="text-primary-foreground" size={24} />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Org Chart */}
      <section className="section-padding gradient-mesh-warm">
        <div className="max-w-3xl mx-auto">
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
