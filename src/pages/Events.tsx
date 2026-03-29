import { motion } from "framer-motion";
import { Apple, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import SectionHeading from "@/components/SectionHeading";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";

const Events = () => {
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
            Always something{" "}
            <span className="text-gradient-gold">happening.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            From iftars to socials to spiritual nights — stay in the loop.
          </motion.p>
        </div>
      </section>

      {/* Calendar Buttons */}
      <section className="px-4 md:px-8 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground mb-6 font-medium">Add our events to your calendar:</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://experience.pitt.edu/msa/apple-calendar/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-hover inline-flex items-center gap-2 px-6 py-3 font-semibold hover:border-primary/30 transition-all"
            >
              <Apple size={18} /> Apple Calendar
            </a>
            <a
              href="https://calendar.google.com/calendar/embed?src=2use05cacfd5hu3q2p49q9dvmc%40group.calendar.google.com&ctz=America%2FNew_York"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-hover inline-flex items-center gap-2 px-6 py-3 font-semibold hover:border-primary/30 transition-all"
            >
              <Calendar size={18} /> Google Calendar
            </a>
          </div>
        </div>
      </section>

      {/* Google Calendar Embed */}
      <section className="px-4 md:px-8 mb-16">
        <div className="max-w-5xl mx-auto glass-card overflow-hidden p-1" style={{ borderRadius: '1.25rem' }}>
          <iframe
            src="https://calendar.google.com/calendar/embed?src=2use05cacfd5hu3q2p49q9dvmc%40group.calendar.google.com&ctz=America%2FNew_York"
            style={{ border: 0, width: '100%', height: '600px', borderRadius: '1rem' }}
            title="MSA at Pitt Google Calendar"
            loading="lazy"
          />
        </div>
      </section>

      {/* Ayat */}
      <section className="section-padding">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-8">
            <ArabicVerse
              arabic="فَإِنَّ مَعَ الْعُسْرِ يُسْرًا"
              translation="For indeed, with hardship comes ease."
              reference="Quran 94:5"
            />
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="section-padding gradient-mesh-warm">
        <div className="max-w-5xl mx-auto">
          <SectionHeading title="Featured Events" />
          <div className="grid md:grid-cols-2 gap-8">
            <GlassCard delay={0}>
              <div className="flex items-center gap-3 mb-4">
                <div className="gold-gradient text-primary-foreground w-14 h-14 rounded-lg flex items-center justify-center font-bold text-sm text-center leading-tight shadow-md">
                  APR<br/>5
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground">MSA TopGolf 2026</h3>
                  <p className="text-muted-foreground text-sm">Sunday · 4–6 PM</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-1">📍 TopGolf Pittsburgh, 400 Presto-Sygan Rd, Bridgeville, PA 15017</p>
              <p className="text-muted-foreground text-sm mb-4">💰 $16.67 for 2 hours (first-timers: $22.67 incl. membership)</p>
              <a
                href="https://forms.gle/hnUHffFFsyysX7vY6"
                target="_blank"
                rel="noopener noreferrer"
                className="gold-gradient text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold inline-block hover:opacity-90 transition-opacity shadow-md"
              >
                RSVP Now →
              </a>
            </GlassCard>
            <GlassCard delay={0.15}>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-secondary text-secondary-foreground w-14 h-14 rounded-lg flex items-center justify-center font-bold text-sm text-center leading-tight shadow-md">
                  MAR<br/>21
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground">MSA Eid Social 2026</h3>
                  <p className="text-muted-foreground text-sm">Saturday · 1–4 PM</p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-1">📍 Schenley Oval, Pittsburgh</p>
              <p className="text-muted-foreground text-sm mb-4">🎉 Pizza, Halaqa, Mehndi, Volleyball, Spikeball — celebrate Eid together!</p>
              <span className="text-muted-foreground/60 text-sm italic">This event has passed</span>
            </GlassCard>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
