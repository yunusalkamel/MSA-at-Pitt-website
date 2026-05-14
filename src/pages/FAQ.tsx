import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import SectionDivider from "@/components/SectionDivider";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES } from "@/lib/sanity";

interface FAQItem {
  q: string;
  a: string | React.ReactNode;
}

// ── Fallback content (shown while Sanity loads or if fetch fails) ──────────────
const FALLBACK_FAQS: FAQItem[] = [
  {
    q: "Do I have to be Muslim to join MSA?",
    a: "Not at all. MSA at Pitt is open to absolutely everyone — Muslim or not, practicing or not, curious or committed. We mean it when we say everyone is welcome.",
  },
  {
    q: "Is there a membership fee?",
    a: "No. MSA membership is completely free. Some events may have a small cost to cover food or venue (e.g. TopGolf), but joining and attending most events is free.",
  },
  {
    q: "How active do I need to be?",
    a: "As active as you want. Some members come to everything; others show up once a semester. There's no attendance requirement, no pressure, and no judgment. Come when you can.",
  },
  {
    q: "What events are good for someone brand new?",
    a: (<>Our weekly halaqas are a great low-key starting point — they're informal, welcoming, and a good way to meet people. Socials like TopGolf or Eid celebrations are also perfect first events. <Link to="/events" className="text-primary underline underline-offset-2 hover:opacity-80">Check the Events page</Link> to see what's coming up.</>),
  },
  {
    q: "I just took my shahada / I'm exploring Islam. Is MSA for me?",
    a: (<>Absolutely. We have revert resources specifically designed for people in your situation. You'll find a supportive community here. <Link to="/resources" className="text-primary underline underline-offset-2 hover:opacity-80">Check out Revert Resources</Link> on our Resources page.</>),
  },
  {
    q: "Where can I pray on campus?",
    a: (<>The main spot is the WPU Reflection Room on the 3rd floor of the William Pitt Union. There are also spaces in the Rec Center (8th floor), Benedum 403, and the School of Public Health. <Link to="/resources/prayer" className="text-primary underline underline-offset-2 hover:opacity-80">See our full Prayer page</Link> for all locations, wudu access, and prayer times.</>),
  },
  {
    q: "Where can I find halal food on or near campus?",
    a: (<>There are several options — The Eatery's fresh beef and chicken breast are halal, and there are multiple restaurants within walking distance including Shah's, Omar's Halal Grill, and Bengal Kabab House. <Link to="/resources/new-to-pitt" className="text-primary underline underline-offset-2 hover:opacity-80">Our New to Pitt guide</Link> has the full list, categorized by distance.</>),
  },
  {
    q: "How do I stay updated on events?",
    a: (<>The best way is to join our WhatsApp announcements chat (linked on the <Link to="/join" className="text-primary underline underline-offset-2 hover:opacity-80">Join page</Link>). You can also follow us on Instagram @msa.at.pitt, sync our Google/Apple calendar, or check the <Link to="/events" className="text-primary underline underline-offset-2 hover:opacity-80">Events page</Link>.</>),
  },
  {
    q: "Can I get involved in leadership or organizing?",
    a: "Yes! MSA has chair positions and committee roles that open up each year. Attend events, get to know the board, and express interest. The best way to start is by showing up consistently.",
  },
  {
    q: "I'm a commuter. Is MSA still relevant to me?",
    a: (<>Definitely. Many of our members commute. Our events are scheduled with commuters in mind, and you're welcome at everything. <Link to="/resources/new-to-pitt" className="text-primary underline underline-offset-2 hover:opacity-80">Our New to Pitt guide</Link> has commuter-specific tips on parking and campus resources.</>),
  },
  {
    q: "How can I give anonymous feedback to the MSA board?",
    a: (<>We have an anonymous suggestions form on our <Link to="/resources" className="text-primary underline underline-offset-2 hover:opacity-80">Resources page</Link> — both a general form and a sisters-only form (read only by a trusted sister on the board). We genuinely read every response.</>),
  },
  {
    q: "Where can I find the university chaplain?",
    a: (<>Imam Muhammad Patel is available Tuesday &amp; Thursday 4–6 PM. <Link to="/resources/chaplain" className="text-primary underline underline-offset-2 hover:opacity-80">Visit the Chaplain page</Link> to learn more and get his contact info.</>),
  },
];

const FAQItem = ({ item, index }: { item: FAQItem; index: number }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="border border-border/50 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left bg-background/60 hover:bg-background/90 transition-colors"
        aria-expanded={open}
      >
        <span className="font-display text-base md:text-lg font-semibold text-foreground">
          {item.q}
        </span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-primary transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 pt-1 font-body text-muted-foreground text-sm md:text-base leading-relaxed">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  const { data: sanityFAQs } = useSanityData<{ question: string; answer: string }[]>(
    QUERIES.faqItems
  );

  // Map Sanity shape → local shape, or fall back to hardcoded list
  const faqs: FAQItem[] =
    sanityFAQs && sanityFAQs.length > 0
      ? sanityFAQs.map((item) => ({ q: item.question, a: item.answer as string }))
      : FALLBACK_FAQS;

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-32 md:py-40 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5" />
          <BridgeBar />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4"
          >
            Got <span className="text-gradient-gold italic inline-block pb-1">questions?</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-satoshi text-xl text-muted-foreground"
          >
            We've tried to answer everything. If you don't see your question here, reach out.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/resources" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft size={14} /> Back to Resources
            </Link>
            <span className="hidden sm:block text-border">·</span>
            <Link to="/resources/prayer" className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
              🕌 Prayer Times & Spaces <ArrowRight size={13} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="section-padding relative">
        <div className="absolute inset-0 steps-surface" />
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="flex flex-col gap-3">
            {faqs.map((item, i) => (
              <FAQItem key={i} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="section-padding-sm gradient-section-gold-soft">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-8 md:p-12">
            <ArabicVerse
              arabic="وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ"
              translation="When My servants ask about Me, I am near."
              reference="Quran 2:186"
            />
          </div>
        </div>
      </section>

      <section className="section-padding-sm text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </section>
    </Layout>
  );
};

export default FAQ;
