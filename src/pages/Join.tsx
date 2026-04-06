import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Instagram, ExternalLink, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";

const steps = [
  {
    num: "01",
    headline: "Make it official.",
    copy: "Fill out the MSA registration form to stay in the loop, receive announcements, and be counted as part of our community.",
    cta: "Register Now",
    href: "https://forms.gle/qVYQb5F4eu3y3DTZ7",
  },
  {
    num: "02",
    headline: "Stay in the loop.",
    copy: "Join our main WhatsApp announcements chat for event updates, reminders, and everything MSA.",
    cta: "Join Announcements Chat",
    href: "https://chat.whatsapp.com/GuWsLzCvRggF9Ua6tWrkJL",
  },
  {
    num: "03",
    headline: "Find your people.",
    copy: "Join the brothers' or sisters' WhatsApp chat to connect with your community directly.",
    ctas: [
      { label: "Brothers Chat", href: "#" },
      { label: "Sisters Chat", href: "#" },
    ],
  },
  {
    num: "04",
    headline: "Follow along.",
    copy: "Stay connected and see what we're up to between events.",
    socials: true,
  },
];

const Join = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <Layout>
      {/* Hero */}
      <section ref={heroRef} className="relative py-32 md:py-44 overflow-hidden text-center">
        <motion.div className="absolute inset-0 parallax-layer" style={{ y: bgY }}>
          <div className="absolute inset-0 gradient-mesh-gold" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '220px' }} />
          <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-secondary/8 blur-[80px]" />
        </motion.div>
        <motion.div className="relative z-10 px-4 max-w-3xl mx-auto" style={{ opacity: contentOpacity }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-5"
          >
            Membership
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight"
          >
            Ready to be part of
            <br />
            <span className="text-gradient-gold italic">something bigger?</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            No matter who you are or where you're coming from, there's a place for you in MSA at Pitt. Four steps to get connected.
          </motion.p>
        </motion.div>
      </section>

      {/* Steps — rich textured ombre section */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 steps-surface" />
        <div className="absolute inset-0 texture-cross opacity-25" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary/[0.07] blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-secondary/[0.06] blur-[90px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/[0.04] blur-[80px]" />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="absolute left-[1.35rem] top-[4.5rem] bottom-0 w-px bg-gradient-to-b from-primary/30 to-primary/5" />
                )}

                <div className="flex gap-6 py-8">
                  <div className="flex-shrink-0 w-11 h-11 rounded-full liquid-glass flex items-center justify-center relative z-10">
                    <span className="font-mono text-xs font-bold text-primary/80 tracking-wider">{step.num}</span>
                  </div>

                  <div className="flex-1 pt-1.5">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">
                      {step.headline}
                    </h3>
                    <p className="text-muted-foreground text-base leading-relaxed mb-5">{step.copy}</p>

                    {"cta" in step && step.cta && (
                      <a href={step.href} target="_blank" rel="noopener noreferrer" className="btn-premium">
                        {step.cta} <ArrowRight size={15} />
                      </a>
                    )}
                    {"ctas" in step && step.ctas && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        {step.ctas.map((c) => (
                          <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="btn-premium">
                            {c.label} <ArrowRight size={15} />
                          </a>
                        ))}
                      </div>
                    )}
                    {step.socials && (
                      <div className="flex flex-wrap gap-3">
                        <a href="https://instagram.com/msa.at.pitt" target="_blank" rel="noopener noreferrer" className="btn-premium-secondary text-sm px-5 py-2.5">
                          <Instagram size={15} /> Instagram
                        </a>
                        <a href="https://linktr.ee/msa.at.pitt" target="_blank" rel="noopener noreferrer" className="btn-premium-secondary text-sm px-5 py-2.5">
                          <ExternalLink size={15} /> Linktree
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* President's note */}
      <section className="section-padding gradient-section-gold-soft relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="glass-card-strong glass-glow p-8 md:p-12">
            <div className="w-12 h-px gold-gradient mx-auto mb-6" />
            <motion.blockquote
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-xl md:text-2xl text-foreground italic leading-relaxed mb-5"
            >
              "We're so glad you're here. Whether you've been Muslim your whole life or you're still figuring things out — MSA is your community. Come as you are."
            </motion.blockquote>
            <div className="w-12 h-px gold-gradient mx-auto mb-4" />
            <p className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">MSA at Pitt President</p>
          </div>
        </div>
      </section>

      {/* Closing Ayat */}
      <section className="section-padding-sm gradient-section-emerald-soft">
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
