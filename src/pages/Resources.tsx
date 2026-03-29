import { motion } from "framer-motion";
import { BookOpen, Heart, Moon, MessageSquare, Calendar, Link as LinkIcon, Apple } from "lucide-react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import SectionHeading from "@/components/SectionHeading";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";

const resources = [
  {
    icon: BookOpen,
    emoji: "📘",
    title: "Tips for Freshmen",
    desc: "New to Pitt? MSA students who've been there share what they wish they'd known.",
    cta: "Read the Guide →",
    href: "https://docs.google.com/document/d/1sWSKZ-PfdgzmSeO_IcZIlhZtkpinHK4esdQSStORKNQ/edit?usp=sharing",
  },
  {
    icon: Heart,
    emoji: "💚",
    title: "Wellness Resources",
    desc: "Mental health, support services, and wellness tools compiled specifically for MSA at Pitt members.",
    cta: "View Resources →",
    href: "https://docs.google.com/document/d/1WLQeRHtyrLR3upxWgGZJ_cnE6mGxyU9u-6iROcgSvVY/edit?usp=sharing",
  },
  {
    icon: Moon,
    emoji: "🌙",
    title: "Revert Resources",
    desc: "Just taken your shahada, or exploring Islam? This guide was made with you in mind.",
    cta: "Explore →",
    href: "https://revert-resources.carrd.co/",
  },
  {
    icon: MessageSquare,
    emoji: "💬",
    title: "Anonymous Suggestions",
    desc: "Have feedback for the MSA board? Share it anonymously — we genuinely read every response.",
    cta: "Leave Feedback →",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSf4Mxrk2dXPCS5v9pu0HIAjrc0D7fEoXaAinYgqZ-Qfi_2oig/viewform?usp=sharing",
  },
  {
    icon: LinkIcon,
    emoji: "🔗",
    title: "Full Links Hub",
    desc: "Looking for something specific? Our Linktree has everything in one place.",
    cta: "Visit Our Linktree →",
    href: "https://linktr.ee/msa.at.pitt",
  },
];

const Resources = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 md:py-40 text-center px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        <div className="absolute inset-0 gradient-mesh-gold" />
        <div className="relative z-10">
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
        </div>
      </section>

      {/* Resource Cards */}
      <section className="section-padding gradient-mesh-warm">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r, i) => (
            <GlassCard key={r.title} delay={i * 0.1}>
              <div className="gold-gradient w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md">
                <r.icon className="text-primary-foreground" size={22} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">{r.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{r.desc}</p>
              <a
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold text-sm hover:underline"
              >
                {r.cta}
              </a>
            </GlassCard>
          ))}

          {/* Calendar card */}
          <GlassCard delay={0.5}>
            <div className="bg-secondary w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md">
              <Calendar className="text-secondary-foreground" size={22} />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Add Events to Calendar</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">Never miss an MSA event — sync our calendar with yours.</p>
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
          </GlassCard>
        </div>
      </section>

      {/* Ayat */}
      <section className="section-padding">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-8">
            <ArabicVerse
              arabic="وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ"
              translation="And whoever relies upon Allah — then He is sufficient for him."
              reference="Quran 65:3"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
