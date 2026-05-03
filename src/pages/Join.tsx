import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Instagram, ExternalLink, ArrowRight, CheckCircle2, Users, Calendar, Heart, MessageCircle, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import SectionDivider from "@/components/SectionDivider";
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
    copy: "Brothers' and sisters' community chats — a direct line to your community for conversation, events, and friendship.",
    ctas: [
      { label: "Brothers Chat", href: "", comingSoon: true },
      { label: "Sisters Chat", href: "", comingSoon: true },
    ],
  },
  {
    num: "04",
    headline: "Follow along.",
    copy: "Stay connected and see what we're up to between events — event recaps, reminders, and community moments.",
    socials: true,
  },
];

const whatHappensNext = [
  {
    icon: Calendar,
    title: "You'll get event invites",
    desc: "Iftars, Eid socials, TopGolf, game nights — you'll hear about everything first.",
  },
  {
    icon: Users,
    title: "A community that shows up",
    desc: "Someone always knows your name. MSA is where strangers become lifelong friends.",
  },
  {
    icon: Heart,
    title: "Support when you need it",
    desc: "Academic stress, homesickness, questions about faith — we've been there. We've got you.",
  },
  {
    icon: MessageCircle,
    title: "A voice in the community",
    desc: "Suggest events, join committees, share ideas. MSA is shaped by its members.",
  },
];

const STORAGE_KEY = "msa-joined";

const Join = () => {
  const [joined, setJoined] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === "true") setJoined(true);
  }, []);

  const handleJoined = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setJoined(true);
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 6000);
  };

  return (
    <Layout>
      {/* Post-join welcome banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
          >
            <div className="liquid-glass-strong rounded-2xl px-6 py-4 flex items-center gap-4 shadow-xl border border-primary/20">
              <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-foreground text-base leading-tight">Alhamdulillah — you're in!</p>
                <p className="font-satoshi text-muted-foreground text-sm mt-0.5">Welcome to MSA at Pitt. Check your WhatsApp for what's next.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative py-32 md:py-44 overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 gradient-mesh-gold" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '220px' }} />
          <BridgeBar />
          <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-secondary/8 blur-[80px]" />
        </div>

        <div className="relative z-10 px-4 max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-body text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-5"
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
            className="font-dm-sans text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            No matter who you are or where you're coming from, there's a place for you in MSA at Pitt.
          </motion.p>
        </div>
      </section>

      {/* Steps */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 steps-surface pointer-events-none" />
        <div className="absolute inset-0 texture-cross opacity-25 pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-primary/[0.07] blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-secondary/[0.06] blur-[90px] pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.42, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
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
                    <p className="font-dm-sans text-muted-foreground text-base leading-relaxed mb-5">{step.copy}</p>

                    {"cta" in step && step.cta && (
                      <div className="flex flex-col sm:flex-row items-start gap-3">
                        <a href={step.href} target="_blank" rel="noopener noreferrer" className="btn-premium">
                          {step.cta} <ArrowRight size={15} />
                        </a>
                        {!joined && step.num === "01" && (
                          <button
                            type="button"
                            onClick={handleJoined}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-body font-semibold self-center"
                          >
                            <CheckCircle2 size={15} /> I've submitted it
                          </button>
                        )}
                        {joined && step.num === "01" && (
                          <span className="inline-flex items-center gap-2 text-sm text-jannah-mid dark:text-msa-gold font-body font-semibold self-center">
                            <CheckCircle2 size={15} /> Registered ✓
                          </span>
                        )}
                      </div>
                    )}
                    {"ctas" in step && step.ctas && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        {step.ctas.map((c) =>
                          c.comingSoon ? (
                            <span key={c.label} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 font-body font-semibold text-sm text-muted-foreground bg-muted/60 border border-border/50 cursor-default">
                              {c.label} — Coming Soon
                            </span>
                          ) : (
                            <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="btn-premium">
                              {c.label} <ArrowRight size={15} />
                            </a>
                          )
                        )}
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

      {/* Topic change: Steps → What happens next */}
      <SectionDivider />

      {/* What happens next */}
      <section className="section-padding gradient-section-gold-soft relative overflow-hidden">
        <div className="absolute inset-0 texture-dots opacity-40 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <p className="font-body text-xs uppercase tracking-[0.2em] text-primary/70 font-semibold mb-2">After you join</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">What happens next</h2>
            </motion.div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whatHappensNext.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-card-strong rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-body font-bold text-foreground text-sm mb-1">{item.title}</p>
                  <p className="font-dm-sans text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Confirmation CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="mt-10 glass-card-strong rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6"
          >
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={22} className="text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="font-display text-xl font-bold text-foreground mb-1">You're in. Alhamdulillah.</p>
              <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed">
                Once you've registered and joined the WhatsApp, you're officially part of the MSA at Pitt family. We'll see you at the next event — and every one after that, insha'Allah.
              </p>
            </div>
            <a
              href="https://forms.gle/qVYQb5F4eu3y3DTZ7"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-premium flex-shrink-0"
            >
              Register Now <ArrowRight size={15} />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Topic change: What's next → Personal message */}
      <SectionDivider />

      {/* President's note */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />

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
            <p className="font-body text-muted-foreground text-sm font-semibold tracking-wide uppercase">MSA at Pitt President</p>
          </div>
        </div>
      </section>

      {/* Closing Ayat */}
      <section className="section-padding-sm gradient-section-emerald-soft">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-7">
            <ArabicVerse
              arabic="يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا"
              translation="O mankind, We created you from male and female and made you peoples and tribes that you may know one another."
              reference="Quran 49:13"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Join;
