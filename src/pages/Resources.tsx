import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Heart, Moon, MessageSquare, Link as LinkIcon, ArrowRight, Mail, Clock, Calendar } from "lucide-react";
import { LINKS } from "@/config/links";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import SectionDivider from "@/components/SectionDivider";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";

const resources = [
  {
    icon: BookOpen, emoji: "📘", title: "Tips for Freshmen",
    desc: "New to Pitt? MSA students who've been there share what they wish they'd known.",
    backDesc: "Covers everything from class registration tips, best halal food spots, prayer room locations, and how to get the most out of your first semester at Pitt.",
    ctas: [
      { label: "Read the Tips", href: "/resources/new-to-pitt", internal: true },
      { label: "Google Doc", href: "https://docs.google.com/document/d/1sWSKZ-PfdgzmSeO_IcZIlhZtkpinHK4esdQSStORKNQ/edit?usp=sharing", internal: false },
    ],
    gradient: "from-[#F2AB23] to-[#C9A84C]",
  },
  {
    icon: Heart, emoji: "💚", title: "Wellness Resources",
    desc: "Mental health, support services, and wellness tools compiled specifically for MSA at Pitt members.",
    backDesc: "Access counseling services, crisis hotlines, stress management tips, and self-care guides curated by MSA members who understand your unique journey.",
    ctas: [{ label: "View Resources", href: "https://docs.google.com/document/d/1WLQeRHtyrLR3upxWgGZJ_cnE6mGxyU9u-6iROcgSvVY/edit?usp=sharing", internal: false }],
    gradient: "from-[#0A5C46] to-[#148066]",
  },
  {
    icon: Moon, emoji: "🌙", title: "Revert Resources",
    desc: "Just taken your shahada, or exploring Islam? This guide was made with you in mind.",
    backDesc: "Step-by-step guidance for new Muslims — from learning how to pray, to finding a supportive community, to understanding the basics of Islamic practice.",
    ctas: [{ label: "Explore", href: "https://revert-resources.carrd.co/", internal: false }],
    gradient: "from-[#14345A] to-[#11233C]",
  },
  {
    icon: MessageSquare, emoji: "💬", title: "Anonymous Suggestions",
    desc: "Have feedback for the MSA board? Share it anonymously — we genuinely read every response.",
    backDesc: "Your voice matters. Completely anonymous, no login required. A sisters-only form is also available — responses are read by a trusted sister on the board.",
    ctas: [
      { label: "General Form", href: "https://docs.google.com/forms/d/e/1FAIpQLSf4Mxrk2dXPCS5v9pu0HIAjrc0D7fEoXaAinYgqZ-Qfi_2oig/viewform?usp=sharing", internal: false },
      { label: "Sisters Form", href: "#sisters-form-placeholder", internal: false, secondary: true },
    ],
    gradient: "from-[#8A6212] to-[#C9A84C]",
  },
];

const FlipCard = ({ resource, index }: { resource: typeof resources[0]; index: number }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
    >
      {/* Mobile: flat */}
      <div className="md:hidden liquid-glass-hover p-6 flex flex-col rounded-[var(--radius)]">
        <div className={`bg-gradient-to-br ${resource.gradient} w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
          <resource.icon className="text-white" size={20} />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground mb-1.5">{resource.title}</h3>
        <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-2">{resource.desc}</p>
        <p className="font-dm-sans text-muted-foreground/70 text-xs leading-relaxed mb-4">{resource.backDesc}</p>
        <div className="flex flex-wrap gap-2">
          {resource.ctas.map((cta) =>
            cta.internal ? (
              <Link key={cta.label} to={cta.href} className={`btn-${(cta as any).secondary ? "premium-secondary" : "premium"} text-sm self-start`}>
                {cta.label} <ArrowRight size={14} />
              </Link>
            ) : (
              <a key={cta.label} href={cta.href} target="_blank" rel="noopener noreferrer" className={`btn-${(cta as any).secondary ? "premium-secondary" : "premium"} text-sm self-start`}>
                {cta.label} <ArrowRight size={14} />
              </a>
            )
          )}
        </div>
      </div>

      {/* Desktop: flip */}
      <div
        className="hidden md:block [perspective:1000px] h-[320px] cursor-pointer"
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
      >
        <div
          className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div className="absolute inset-0 [backface-visibility:hidden] liquid-glass-hover p-6 md:p-8 flex flex-col rounded-[var(--radius)]">
            <div className={`bg-gradient-to-br ${resource.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
              <resource.icon className="text-white" size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">{resource.title}</h3>
            <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed flex-1">{resource.desc}</p>
            <p className="font-body text-primary text-xs font-semibold mt-3 opacity-55">Hover to learn more →</p>
          </div>
          <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[var(--radius)] bg-gradient-to-br ${resource.gradient} p-6 md:p-8 flex flex-col justify-between shadow-xl`}>
            <div>
              <span className="text-3xl mb-3 block">{resource.emoji}</span>
              <h3 className="font-display text-xl font-bold text-white mb-3">{resource.title}</h3>
              <p className="font-dm-sans text-white/85 text-sm leading-relaxed">{resource.backDesc}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {resource.ctas.map((cta) =>
                cta.internal ? (
                  <Link
                    key={cta.label}
                    to={cta.href}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors"
                  >
                    {cta.label} <ArrowRight size={14} />
                  </Link>
                ) : (
                  <a
                    key={cta.label}
                    href={cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors"
                  >
                    {cta.label} <ArrowRight size={14} />
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Resources = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 md:py-40 text-center px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
          <div className="absolute inset-0 gradient-mesh-gold" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          <div className="absolute top-1/3 left-1/5 w-64 h-64 rounded-full bg-primary/8 blur-[80px]" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-secondary/8 blur-[80px]" />
        </div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }} className="inline-block mb-6">
            <span className="text-6xl">🤲</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4">
            We've got <span className="text-gradient-gold inline-block pb-1">you.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="font-satoshi text-xl text-muted-foreground max-w-2xl mx-auto">
            From navigating college to navigating your faith — here are resources to support you.
          </motion.p>
        </div>
      </section>

      {/* Resource Cards */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 steps-surface pointer-events-none" />
        <div className="absolute inset-0 texture-cross opacity-25 pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-primary/[0.06] blur-[110px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-secondary/[0.05] blur-[90px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <SectionHeading title="Your Resources" label="Everything You Need" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r, i) => (
              <FlipCard key={r.title} resource={r} index={i} />
            ))}

            {/* Prayer card — combined prayer page */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: 0.32 }}
            >
              <div className="md:hidden liquid-glass-hover p-6 flex flex-col rounded-[var(--radius)]">
                <div className="bg-gradient-to-br from-[#0A5C46] to-[#148066] w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-xl">🕌</span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1.5">Prayer</h3>
                <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-4">Prayer times, Jummah info, on-campus spaces, and nearby masajid — all in one place.</p>
                <Link to="/resources/prayer" className="btn-premium text-sm self-start">Open Prayer Hub <ArrowRight size={14} /></Link>
              </div>
              <div className="hidden md:block [perspective:1000px] h-[320px] cursor-pointer group">
                <Link to="/resources/prayer" className="block h-full liquid-glass-hover p-6 md:p-8 flex flex-col rounded-[var(--radius)] hover:-translate-y-1 transition-transform duration-300">
                  <div className="bg-gradient-to-br from-[#0A5C46] to-[#148066] w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-2xl">🕌</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">Prayer</h3>
                  <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed flex-1">Prayer times, Jummah, on-campus spaces, and nearby masajid — all in one place.</p>
                  <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold mt-3">Open Prayer Hub <ArrowRight size={14} /></span>
                </Link>
              </div>
            </motion.div>

            {/* Chaplain card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: 0.4 }}
            >
              <div className="md:hidden liquid-glass-hover p-6 flex flex-col rounded-[var(--radius)]">
                <div className="bg-gradient-to-br from-[#14345A] to-[#11233C] w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-xl">🤲</span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1.5">University Chaplain</h3>
                <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-4">Imam Muhammad Patel — Islamic counseling, halaqahs, Jummah, and guidance for every student.</p>
                <div className="flex gap-2 flex-wrap">
                  <Link to="/resources/chaplain" className="btn-premium text-sm self-start">Meet the Chaplain <ArrowRight size={14} /></Link>
                  <a href="mailto:imam@pitt.edu" className="btn-premium-secondary text-sm self-start"><Mail size={13} /> Email</a>
                </div>
              </div>
              <div className="hidden md:block [perspective:1000px] h-[320px] cursor-pointer">
                <Link to="/resources/chaplain" className="block h-full liquid-glass-hover p-6 md:p-8 flex flex-col rounded-[var(--radius)] hover:-translate-y-1 transition-transform duration-300">
                  <div className="bg-gradient-to-br from-[#14345A] to-[#11233C] w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-2xl">🤲</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">University Chaplain</h3>
                  <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed flex-1">Islamic counseling, naseeha, halaqahs, and support from Imam Muhammad Patel.</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Clock size={12} className="text-primary" />
                    <span className="text-xs text-muted-foreground">Tue &amp; Thu 4–6 PM</span>
                  </div>
                  <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold mt-2">Learn More <ArrowRight size={14} /></span>
                </Link>
              </div>
            </motion.div>

            {/* FAQ card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: 0.48 }}
            >
              <div className="md:hidden liquid-glass-hover p-6 flex flex-col rounded-[var(--radius)]">
                <div className="bg-gradient-to-br from-[#8A6212] to-[#C9A84C] w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <span className="text-xl">❓</span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1.5">FAQ</h3>
                <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-4">Answers to the most common questions about joining, events, prayer, halal food, and more.</p>
                <Link to="/resources/faq" className="btn-premium text-sm self-start">Read FAQ <ArrowRight size={14} /></Link>
              </div>
              <div className="hidden md:block [perspective:1000px] h-[320px] cursor-pointer">
                <Link to="/resources/faq" className="block h-full liquid-glass-hover p-6 md:p-8 flex flex-col rounded-[var(--radius)] hover:-translate-y-1 transition-transform duration-300">
                  <div className="bg-gradient-to-br from-[#8A6212] to-[#C9A84C] w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-2xl">❓</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">FAQ</h3>
                  <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed flex-1">Answers to the most common questions about joining, events, prayer, halal food, and more.</p>
                  <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold mt-3">Read FAQ <ArrowRight size={14} /></span>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Bottom action row — calendar subscriptions + linktree */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-10 liquid-glass-hover p-6 md:p-8 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <div>
              <p className="font-display text-lg font-bold text-foreground mb-1">Stay Connected</p>
              <p className="font-dm-sans text-muted-foreground text-sm">Subscribe to the events calendar or browse everything on our Linktree.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
              <a href={LINKS.googleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="btn-premium text-sm px-4 py-2.5 whitespace-nowrap">
                <Calendar size={14} /> Google Calendar
              </a>
              <a href={LINKS.appleCalendarSubscribe} target="_blank" rel="noopener noreferrer" className="btn-premium-secondary text-sm px-4 py-2.5 whitespace-nowrap">
                <Calendar size={14} /> Apple Calendar
              </a>
              <a href={LINKS.linktree} target="_blank" rel="noopener noreferrer" className="btn-premium-secondary text-sm px-4 py-2.5 whitespace-nowrap">
                <LinkIcon size={14} /> Linktree
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* Ayat */}
      <section className="section-padding-sm gradient-section-gold-soft relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="glass-card-strong glass-glow p-8">
            <ArabicVerse
              arabic="رَبِّ زِدْنِي عِلْمًا"
              translation="My Lord, increase me in knowledge."
              reference="Quran 20:114"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
