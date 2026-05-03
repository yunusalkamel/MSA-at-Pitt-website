import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Heart, Moon, MessageSquare, Calendar, Link as LinkIcon, Apple, ArrowRight, Clock, Mail, ExternalLink } from "lucide-react";
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
        <a href={resource.href} target="_blank" rel="noopener noreferrer" className="btn-premium text-sm self-start">
          {resource.cta} <ArrowRight size={14} />
        </a>
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
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 md:py-40 text-center px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
          <div className="absolute inset-0 gradient-mesh-gold" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          <div className="absolute top-1/3 left-1/5 w-64 h-64 rounded-full bg-primary/8 blur-[80px]" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-secondary/8 blur-[80px]" />
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55 }}
            className="inline-block mb-6"
          >
            <span className="text-6xl">🤲</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4"
          >
            We've got <span className="text-gradient-gold">you.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="font-satoshi text-xl text-muted-foreground max-w-2xl mx-auto"
          >
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

            {/* Calendar card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.45, delay: 0.4 }}
              className="liquid-glass-hover p-6 md:p-8 h-[320px] flex flex-col rounded-[var(--radius)]"
            >
              <div className="bg-gradient-to-br from-[#14345A] to-[#11233C] w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Calendar className="text-white" size={24} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">Add Events to Calendar</h3>
              <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-4 flex-1">Never miss an MSA event — sync our calendar with yours.</p>
              <div className="flex flex-col gap-2">
                <a href="https://experience.pitt.edu/msa/apple-calendar/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  <Apple size={14} /> Apple Calendar
                </a>
                <a href="https://calendar.google.com/calendar/embed?src=2use05cacfd5hu3q2p49q9dvmc%40group.calendar.google.com&ctz=America%2FNew_York" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                  <Calendar size={14} /> Google Calendar
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Topic change: General resources → Jummah */}
      <SectionDivider />

      {/* Jummah Info */}
      <section className="section-padding gradient-section-gold-soft relative overflow-hidden">
        <div className="absolute inset-0 texture-dots opacity-50 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <SectionHeading title="Jummah Prayer" label="Every Friday" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card-strong rounded-2xl p-6 md:p-8"
          >
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🕌</span>
                  </div>
                  <div>
                    <p className="font-body font-bold text-foreground text-base">Every Friday at 2:00 PM</p>
                    <p className="font-body text-muted-foreground text-sm">Typically held in Ohara Ballroom</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-xl bg-primary/[0.06] border border-primary/15 px-4 py-3">
                    <Clock size={15} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm">Prayer time: 2:00 PM sharp</p>
                      <p className="font-dm-sans text-muted-foreground text-xs mt-0.5 leading-relaxed">Arrive a few minutes early for khutbah. Location may change — always confirm before heading over.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-body font-semibold text-foreground text-sm mb-3">Confirm location each week:</p>
                <div className="space-y-2.5">
                  <a
                    href="https://instagram.com/msa.at.pitt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-colors px-4 py-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-foreground text-sm">Check Instagram Stories</p>
                      <p className="font-body text-muted-foreground text-xs">@msa.at.pitt — posted Friday mornings</p>
                    </div>
                    <ExternalLink size={13} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </a>

                  <a
                    href="https://chat.whatsapp.com/GuWsLzCvRggF9Ua6tWrkJL"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-colors px-4 py-3 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center flex-shrink-0">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body font-semibold text-foreground text-sm">MSA WhatsApp Announcements</p>
                      <p className="font-body text-muted-foreground text-xs">Location confirmations & updates</p>
                    </div>
                    <ExternalLink size={13} className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Topic change: Jummah → Chaplain */}
      <SectionDivider />

      {/* Imam Muhammad Patel */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 steps-surface pointer-events-none" />
        <div className="absolute inset-0 texture-dots opacity-40 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <SectionHeading title="University Chaplain" label="Spiritual Guidance" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card-strong rounded-2xl overflow-hidden"
          >
            <div className="grid md:grid-cols-[280px_1fr] gap-0">
              {/* Photo skeleton */}
              <div className="relative bg-gradient-to-br from-secondary/10 to-primary/10 flex items-center justify-center min-h-[280px] md:min-h-full">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '150px' }} />
                <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
                  {/* Avatar placeholder */}
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/25 flex items-center justify-center">
                    <span className="font-display text-3xl font-bold text-primary/50">MP</span>
                  </div>
                  <p className="font-body text-xs text-muted-foreground/60 italic">Photo coming soon</p>
                </div>
              </div>

              {/* Info */}
              <div className="p-6 md:p-8">
                <div className="mb-1">
                  <span className="font-body text-xs font-semibold uppercase tracking-[0.15em] text-primary/70">University Imam & Chaplain</span>
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">Imam Muhammad Patel</h3>
                <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-5">
                  Born in Blackburn, England to a Gujarati family, Imam Muhammad Patel memorized the Quran at age 15. He completed his Alim program and has led Tarawih prayers in Rome and Boynton Beach. He specializes in teaching children with learning challenges — bringing patience, warmth, and deep knowledge to every interaction.
                </p>
                <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-6">
                  At MSA at Pitt, Imam Patel assists with Jummah, tabling, Islamic counseling, naseeha, marketing, halaqahs, and leading prayers. He is a resource for any student seeking guidance.
                </p>

                {/* Office hours */}
                <div className="flex items-start gap-3 rounded-xl bg-primary/[0.06] border border-primary/15 px-4 py-3 mb-5">
                  <Clock size={15} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-body font-semibold text-foreground text-sm">Office Hours</p>
                    <p className="font-body text-muted-foreground text-sm mt-0.5">Tuesday & Thursday, 4:00 – 6:00 PM</p>
                  </div>
                </div>

                {/* Contact / booking */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href="mailto:imam@pitt.edu"
                    className="inline-flex items-center gap-2 btn-premium-secondary text-sm px-4 py-2"
                    aria-label="Email Imam Muhammad Patel"
                  >
                    <Mail size={14} /> Email
                  </a>
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-body font-semibold text-muted-foreground bg-muted/60 border border-border/50 cursor-default"
                    title="Booking link coming soon"
                  >
                    <ExternalLink size={14} /> Book a Meeting — Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Topic change: Chaplain → Closing */}
      <SectionDivider />

      {/* Ayat */}
      <section className="section-padding-sm gradient-section-gold-soft relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
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
