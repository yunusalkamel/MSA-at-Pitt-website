import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BookOpen, Heart, Moon, MessageSquare, Calendar, Link as LinkIcon, Apple, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import SectionHeading from "@/components/SectionHeading";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";

const resources = [
  {
    icon: BookOpen, emoji: "📘", title: "Tips for Freshmen",
    desc: "New to Pitt? MSA students who've been there share what they wish they'd known.",
    backDesc: "Covers everything from class registration tips, best halal food spots, prayer room locations, and how to get the most out of your first semester at Pitt.",
    cta: "Read the Guide", href: "https://docs.google.com/document/d/1sWSKZ-PfdgzmSeO_IcZIlhZtkpinHK4esdQSStORKNQ/edit?usp=sharing",
    gradient: "from-[#F2AB23] to-[#C9A84C]",
  },
  {
    icon: Heart, emoji: "💚", title: "Wellness Resources",
    desc: "Mental health, support services, and wellness tools compiled specifically for MSA at Pitt members.",
    backDesc: "Access counseling services, crisis hotlines, stress management tips, and self-care guides curated by MSA members who understand your unique journey.",
    cta: "View Resources", href: "https://docs.google.com/document/d/1WLQeRHtyrLR3upxWgGZJ_cnE6mGxyU9u-6iROcgSvVY/edit?usp=sharing",
    gradient: "from-[#0A5C46] to-[#148066]",
  },
  {
    icon: Moon, emoji: "🌙", title: "Revert Resources",
    desc: "Just taken your shahada, or exploring Islam? This guide was made with you in mind.",
    backDesc: "Step-by-step guidance for new Muslims — from learning how to pray, to finding a supportive community, to understanding the basics of Islamic practice.",
    cta: "Explore", href: "https://revert-resources.carrd.co/",
    gradient: "from-[#14345A] to-[#11233C]",
  },
  {
    icon: MessageSquare, emoji: "💬", title: "Anonymous Suggestions",
    desc: "Have feedback for the MSA board? Share it anonymously — we genuinely read every response.",
    backDesc: "Your voice matters. Tell us what events you want to see, what we can improve, or anything else on your mind. Completely anonymous, no login required.",
    cta: "Leave Feedback", href: "https://docs.google.com/forms/d/e/1FAIpQLSf4Mxrk2dXPCS5v9pu0HIAjrc0D7fEoXaAinYgqZ-Qfi_2oig/viewform?usp=sharing",
    gradient: "from-[#8A6212] to-[#C9A84C]",
  },
  {
    icon: LinkIcon, emoji: "🔗", title: "Full Links Hub",
    desc: "Looking for something specific? Our Linktree has everything in one place.",
    backDesc: "One link to rule them all — WhatsApp groups, social media, event forms, calendars, and every other MSA resource consolidated in our Linktree.",
    cta: "Visit Linktree", href: "https://linktr.ee/msa.at.pitt",
    gradient: "from-[#148066] to-[#F2AB23]",
  },
];

const FlipCard = ({ resource, index }: { resource: typeof resources[0]; index: number }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Mobile: flat card with all info visible, no flip */}
      <div className="md:hidden liquid-glass-hover p-6 flex flex-col rounded-[var(--radius)]">
        <div className={`bg-gradient-to-br ${resource.gradient} w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
          <resource.icon className="text-white" size={20} />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground mb-1.5">{resource.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">{resource.desc}</p>
        <p className="text-muted-foreground/70 text-xs leading-relaxed mb-4">{resource.backDesc}</p>
        <a
          href={resource.href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-premium text-sm self-start"
        >
          {resource.cta} <ArrowRight size={14} />
        </a>
      </div>

      {/* Desktop: flip card on hover */}
      <div
        className="hidden md:block [perspective:1000px] h-[320px] cursor-pointer"
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
      >
        <div
          className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div className="absolute inset-0 [backface-visibility:hidden] liquid-glass-hover p-6 md:p-8 flex flex-col rounded-[var(--radius)]">
            <div className={`bg-gradient-to-br ${resource.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
              <resource.icon className="text-white" size={24} />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">{resource.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed flex-1">{resource.desc}</p>
            <p className="text-primary text-xs font-semibold mt-3 opacity-60">
              Hover to learn more →
            </p>
          </div>
          {/* Back */}
          <div className={`absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[var(--radius)] bg-gradient-to-br ${resource.gradient} p-6 md:p-8 flex flex-col justify-between shadow-xl`}>
            <div>
              <span className="text-3xl mb-3 block">{resource.emoji}</span>
              <h3 className="font-display text-xl font-bold text-white mb-3">{resource.title}</h3>
              <p className="text-white/85 text-sm leading-relaxed">{resource.backDesc}</p>
            </div>
            <a
              href={resource.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors self-start mt-4"
            >
              {resource.cta} <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Resources = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <Layout>
      {/* Hero */}
      <section ref={heroRef} className="relative py-32 md:py-40 text-center px-4 overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: bgY }}>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
          <div className="absolute inset-0 gradient-mesh-gold" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          <div className="absolute top-1/3 left-1/5 w-64 h-64 rounded-full bg-primary/8 blur-[80px]" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-secondary/8 blur-[80px]" />
        </motion.div>
        <motion.div className="relative z-10" style={{ opacity: contentOpacity }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-6"
          >
            <span className="text-6xl">🤲</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4"
          >
            We've got <span className="text-gradient-gold">you.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            From navigating college to navigating your faith — here are resources to support you.
          </motion.p>
        </motion.div>
      </section>

      {/* Flip Resource Cards */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 steps-surface" />
        <div className="absolute inset-0 texture-cross opacity-25" />
        <div className="absolute top-1/3 right-0 w-96 h-96 rounded-full bg-primary/[0.06] blur-[110px]" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 rounded-full bg-secondary/[0.05] blur-[90px]" />
        <div className="max-w-5xl mx-auto relative z-10">
          <SectionHeading title="Your Resources" label="Everything You Need" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r, i) => (
              <FlipCard key={r.title} resource={r} index={i} />
            ))}

            {/* Calendar card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="liquid-glass-hover p-6 md:p-8 h-[320px] flex flex-col rounded-[var(--radius)]"
            >
              <div className="bg-gradient-to-br from-[#14345A] to-[#11233C] w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Calendar className="text-white" size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">Add Events to Calendar</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1">Never miss an MSA event — sync our calendar with yours.</p>
              <div className="flex flex-col gap-2">
                <a
                  href="https://experience.pitt.edu/msa/apple-calendar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <Apple size={14} /> Apple Calendar
                </a>
                <a
                  href="https://calendar.google.com/calendar/embed?src=2use05cacfd5hu3q2p49q9dvmc%40group.calendar.google.com&ctz=America%2FNew_York"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <Calendar size={14} /> Google Calendar
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ayat */}
      <section className="section-padding-sm gradient-section-gold-soft relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
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
