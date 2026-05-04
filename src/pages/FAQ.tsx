import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import SectionDivider from "@/components/SectionDivider";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES } from "@/lib/sanity";

interface FAQItem {
  q: string;
  a: string;
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
    a: "Our weekly halaqas are a great low-key starting point — they're informal, welcoming, and a good way to meet people. Socials like TopGolf or Eid celebrations are also perfect first events. Check the Events page to see what's coming up.",
  },
  {
    q: "I just took my shahada / I'm exploring Islam. Is MSA for me?",
    a: "Absolutely. We have revert resources specifically designed for people in your situation. You'll find a supportive community here. Check out the Revert Resources link on our Resources page.",
  },
  {
    q: "Where can I pray on campus?",
    a: "The main spot is the WPU Reflection Room on the 3rd floor of the William Pitt Union. There are also spaces in the Rec Center (8th floor), Benedum 403, and the School of Public Health. See our Prayer Locations page for full details including wudu access.",
  },
  {
    q: "Where can I find halal food on or near campus?",
    a: "There are several options! The Eatery's fresh beef and chicken breast are halal, and there are multiple halal restaurants within walking distance including Shah's, Omar's Halal Grill, and Bengal Kabab House. Our New to Pitt guide has the complete list.",
  },
  {
    q: "How do I stay updated on events?",
    a: "The best way is to join our WhatsApp announcements chat (linked on the Join page). You can also follow us on Instagram @msa.at.pitt, sync our Google/Apple calendar, or just check the Events page on this site.",
  },
  {
    q: "Can I get involved in leadership or organizing?",
    a: "Yes! MSA has chair positions and committee roles that open up each year. Attend events, get to know the board, and express interest. The best way to start is by showing up consistently.",
  },
  {
    q: "I'm a commuter. Is MSA still relevant to me?",
    a: "Definitely. Many of our members commute. Our events are scheduled with commuters in mind, and you're welcome at everything. Check our New to Pitt guide for commuter-specific tips on parking and campus resources.",
  },
  {
    q: "How can I give anonymous feedback to the MSA board?",
    a: "We have an anonymous suggestions form linked on the Resources page. We genuinely read every response — your voice matters.",
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
            <p className="px-5 md:px-6 pb-5 md:pb-6 pt-1 font-body text-muted-foreground text-sm md:text-base leading-relaxed">
              {item.a}
            </p>
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
      ? sanityFAQs.map((item) => ({ q: item.question, a: item.answer }))
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
