import { motion } from "framer-motion";
import { Apple, Calendar, MapPin, DollarSign, Clock, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import GlassCard from "@/components/GlassCard";
import SectionHeading from "@/components/SectionHeading";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern.jpg";
import eventsImg from "@/assets/events-social.jpg";

const Events = () => {
  return (
    <Layout>
      {/* Hero — enhanced with photo background */}
      <section className="relative py-32 md:py-40 text-center px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src={eventsImg} alt="MSA events" className="w-full h-full object-cover" width={1280} height={720} />
          <div className="absolute inset-0 bg-gradient-to-b from-accent/85 via-accent/60 to-accent/85" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: '200px' }} />
        </div>
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <PartyPopper className="inline text-primary" size={40} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl font-bold text-accent-foreground mb-4"
          >
            Always something{" "}
            <span className="text-gradient-gold">happening.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-accent-foreground/70 max-w-2xl mx-auto"
          >
            From iftars to socials to spiritual nights — stay in the loop.
          </motion.p>
        </div>
      </section>

      {/* Ayat divider */}
      <section className="section-padding gradient-mesh-gold">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card-strong glass-glow p-8">
            <ArabicVerse
              arabic="فَإِنَّ مَعَ الْعُسْرِ يُسْرًا"
              translation="For indeed, with hardship comes ease."
              reference="Quran 94:5"
            />
          </div>
        </div>
      </section>

      {/* Calendar Buttons */}
      <section className="section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <SectionHeading title="Stay Connected" subtitle="Add our events to your calendar and never miss a moment." />
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://experience.pitt.edu/msa/apple-calendar/"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-hover inline-flex items-center gap-3 px-8 py-4 font-semibold text-foreground hover:border-primary/30 transition-all"
            >
              <div className="bg-gradient-to-br from-[hsl(216,50%,10%)] to-[hsl(216,40%,25%)] w-10 h-10 rounded-lg flex items-center justify-center">
                <Apple size={20} className="text-white" />
              </div>
              Apple Calendar
            </a>
            <a
              href="https://calendar.google.com/calendar/embed?src=2use05cacfd5hu3q2p49q9dvmc%40group.calendar.google.com&ctz=America%2FNew_York"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card-hover inline-flex items-center gap-3 px-8 py-4 font-semibold text-foreground hover:border-primary/30 transition-all"
            >
              <div className="gold-gradient w-10 h-10 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-primary-foreground" />
              </div>
              Google Calendar
            </a>
          </div>
        </div>
      </section>

      {/* Google Calendar Embed */}
      <section className="px-4 md:px-8 mb-16">
        <div className="max-w-5xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-primary via-secondary to-primary rounded-3xl opacity-20 group-hover:opacity-30 transition-opacity blur-sm" />
          <div className="relative glass-card overflow-hidden p-1" style={{ borderRadius: '1.25rem' }}>
            <iframe
              src="https://calendar.google.com/calendar/embed?src=2use05cacfd5hu3q2p49q9dvmc%40group.calendar.google.com&ctz=America%2FNew_York"
              style={{ border: 0, width: '100%', height: '600px', borderRadius: '1rem' }}
              title="MSA at Pitt Google Calendar"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="section-padding gradient-mesh-warm">
        <div className="max-w-5xl mx-auto">
          <SectionHeading title="Featured Events" label="Don't Miss Out" />
          <div className="grid md:grid-cols-2 gap-8">
            {/* TopGolf */}
            <GlassCard delay={0}>
              <div className="flex items-center gap-4 mb-5">
                <div className="gold-gradient text-primary-foreground w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-sm text-center leading-tight shadow-lg">
                  APR<br/>5
                </div>
                <div>
                  <h3 className="font-display font-bold text-2xl text-foreground">MSA TopGolf 2026</h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-1"><Clock size={13} /> Sunday · 4–6 PM</p>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  <MapPin size={14} className="text-secondary shrink-0" /> TopGolf Pittsburgh, 400 Presto-Sygan Rd, Bridgeville, PA
                </p>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  <DollarSign size={14} className="text-primary shrink-0" /> $16.67 for 2 hours (first-timers: $22.67 incl. membership)
                </p>
              </div>
              <a
                href="https://forms.gle/hnUHffFFsyysX7vY6"
                target="_blank"
                rel="noopener noreferrer"
                className="gold-gradient text-primary-foreground px-7 py-3 rounded-full text-sm font-semibold inline-block hover:opacity-90 transition-opacity shadow-lg"
              >
                RSVP Now →
              </a>
            </GlassCard>

            {/* Eid Social */}
            <GlassCard delay={0.15}>
              <div className="flex items-center gap-4 mb-5">
                <div className="bg-gradient-to-br from-[hsl(153,58%,26%)] to-[hsl(160,50%,40%)] text-white w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-sm text-center leading-tight shadow-lg">
                  MAR<br/>21
                </div>
                <div>
                  <h3 className="font-display font-bold text-2xl text-foreground">MSA Eid Social 2026</h3>
                  <p className="text-muted-foreground text-sm flex items-center gap-1"><Clock size={13} /> Saturday · 1–4 PM</p>
                </div>
              </div>
              <div className="space-y-2 mb-5">
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  <MapPin size={14} className="text-secondary shrink-0" /> Schenley Oval, Pittsburgh
                </p>
                <p className="text-muted-foreground text-sm">
                  🎉 Pizza, Halaqa, Mehndi, Volleyball, Spikeball — celebrate Eid together!
                </p>
              </div>
              <span className="text-muted-foreground/60 text-sm italic glass-card px-4 py-1.5 rounded-full">Past Event</span>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Gallery CTA */}
      <section className="section-padding text-center">
        <SectionHeading title="See Our Memories" subtitle="Browse photos from past events in our gallery." />
        <Link
          to="/gallery"
          className="gold-gradient text-primary-foreground px-8 py-3.5 rounded-full font-semibold text-lg inline-block hover:opacity-90 transition-opacity shadow-lg"
        >
          View Gallery →
        </Link>
      </section>

      {/* Bottom Ayat */}
      <section className="section-padding gradient-mesh-warm">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-8">
            <ArabicVerse
              arabic="وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ"
              translation="And your Lord is going to give you, and you will be satisfied."
              reference="Quran 93:5"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
