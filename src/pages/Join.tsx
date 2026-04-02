import { motion } from "framer-motion";
import { Instagram, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";

const steps = [
  {
    num: 1,
    headline: "Make it official.",
    copy: "Fill out the MSA registration form to stay in the loop, receive announcements, and be counted as part of our community.",
    cta: "Register Now →",
    href: "https://forms.gle/qVYQb5F4eu3y3DTZ7",
  },
  {
    num: 2,
    headline: "Stay in the loop.",
    copy: "Join our main WhatsApp announcements chat for event updates, reminders, and everything MSA.",
    cta: "Join Announcements Chat →",
    href: "https://chat.whatsapp.com/GuWsLzCvRggF9Ua6tWrkJL",
  },
  {
    num: 3,
    headline: "Find your people.",
    copy: "Join the brothers' or sisters' WhatsApp chat to connect with your community directly.",
    ctas: [
      { label: "Brothers Chat →", href: "#" },
      { label: "Sisters Chat →", href: "#" },
    ],
  },
  {
    num: 4,
    headline: "Follow along.",
    copy: "Stay connected and see what we're up to between events.",
    socials: true,
  },
];

const Join = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 md:py-40 overflow-hidden text-center">
        <div className="absolute inset-0 gradient-mesh-gold" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="relative z-10 px-4 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6"
          >
            Ready to be part of something{" "}
            <span className="text-gradient-gold">bigger?</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground"
          >
            No matter who you are or where you're coming from, there's a place for you in MSA at Pitt. Follow the steps below to make it official.
          </motion.p>
        </div>
      </section>

      {/* Steps */}
      <section className="section-padding gradient-mesh-warm relative overflow-hidden">
        <div className="absolute inset-0 texture-lines" />
        <div className="max-w-3xl mx-auto space-y-8 relative z-10">
          {steps.map((step, i) => (
            <GlassCard key={step.num} delay={i * 0.12} className="relative">
              <div className="flex items-start gap-6">
                <div className="gold-gradient text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-xl flex-shrink-0">
                  {step.num}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">{step.headline}</h3>
                  <p className="text-muted-foreground text-lg mb-4">{step.copy}</p>
                  {"cta" in step && step.cta && (
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-premium"
                    >
                      {step.cta}
                    </a>
                  )}
                  {"ctas" in step && step.ctas && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      {step.ctas.map((c) => (
                        <a
                          key={c.label}
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-premium text-center"
                        >
                          {c.label}
                        </a>
                      ))}
                    </div>
                  )}
                  {step.socials && (
                    <div className="flex flex-wrap gap-3">
                      <a href="https://instagram.com/msa.at.pitt" target="_blank" rel="noopener noreferrer" className="btn-premium-secondary text-sm px-4 py-2">
                        <Instagram size={16} /> Instagram
                      </a>
                      <a href="https://linktr.ee/msa.at.pitt" target="_blank" rel="noopener noreferrer" className="btn-premium-secondary text-sm px-4 py-2">
                        <ExternalLink size={16} /> Linktree
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Welcome Note */}
      <section className="section-padding gradient-section-gold-soft relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="glass-card-strong glass-glow p-8 md:p-12">
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xl md:text-2xl text-foreground italic font-display leading-relaxed mb-6"
            >
              "We're so glad you're here. Whether you've been Muslim your whole life or you're still figuring things out — MSA is your community. Come as you are."
            </motion.blockquote>
            <p className="text-muted-foreground font-semibold">— MSA at Pitt President</p>
          </div>
        </div>
      </section>

      {/* Bottom Ayat */}
      <section className="section-padding gradient-section-emerald-soft">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-7">
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

export default Join;
