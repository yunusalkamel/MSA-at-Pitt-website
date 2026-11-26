import { LinkField, CardCopies, TextField, ContentScope } from "@/editor/content";
import { motion } from "framer-motion";
import { Mail, BookOpen, MessageSquare, ArrowRight, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import BridgeBar from "@/components/BridgeBar";
import ArabicVerse from "@/components/ArabicVerse";
import patternImg from "@/assets/islamic-pattern-360.webp";
import { LINKS } from "@/config/links";
import { usePageMeta } from "@/lib/usePageMeta";
import { useSanityData } from "@/hooks/useSanityData";
import { QUERIES } from "@/lib/sanity";

interface ResourcesData {
  imamName?: string;
  imamTitle?: string;
  imamBio?: string;
  imamOfficeHours?: string;
  imamEmail?: string;
  imamBookingUrl?: string;
}

const ImamCard = () => {
  const { data } = useSanityData<ResourcesData>(QUERIES.resourcesPage);

  // Sensible fallbacks so the card always renders
  const name = data?.imamName || "Your MSA Chaplain";
  const title = data?.imamTitle || "Spiritual Guidance";
  const bio =
    data?.imamBio ||
    "For Islamic counseling, naseeha, or personal guidance — our chaplain is available to all students.";
  const officeHours = data?.imamOfficeHours;
  const email = data?.imamEmail;
  const booking = data?.imamBookingUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="glass-card-strong rounded-2xl p-7 flex flex-col gap-5"
    >
      <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center flex-shrink-0">
        <BookOpen size={22} className="text-secondary" />
      </div>
      <div className="flex-1">
        <p className="eyebrow text-jannah-mid dark:text-msa-gold/70 mb-1"><TextField id="Contact_1">{title}</TextField></p>
        <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-tight">
          <TextField id="Contact_2">{name}</TextField>
        </h3>
        <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed mb-3">
          <TextField id="Contact_3">{bio}</TextField>
        </p>
        {officeHours && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground mb-4 font-body">
            <span className="font-semibold text-foreground/70"><TextField id="Contact_4">Office hours:</TextField></span>
            <span><TextField id="Contact_5">{officeHours}</TextField></span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 mt-auto">
        {email && (
          <LinkField fieldId="contact-chaplain-email"
            href={`mailto:${email}`}
            className="btn-premium-secondary text-sm px-5 py-2.5 justify-center"
          >
            <Mail size={14} /><TextField id="Contact_6"> Email </TextField>{name.split(" ")[0]}
          </LinkField>
        )}
          <LinkField fieldId="contact-booking"
            href={booking || undefined}
            fallback={<span className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-body font-semibold text-sm text-muted-foreground bg-muted/60 border border-border/50 cursor-default"><TextField id="Contact_8">
            Booking link coming soon
          </TextField></span>}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-premium text-sm px-5 py-2.5 justify-center"
          >
            <Calendar size={14} /><TextField id="Contact_7"> Book a Meeting
          </TextField></LinkField>
      </div>
    </motion.div>
  );
};

const Contact = () => {
  usePageMeta({
    title: "Contact — MSA at Pitt",
    description: "Reach out to MSA at Pitt leadership, our chaplain, or leave anonymous feedback. We read every message.",
  });

  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-28 md:py-36 overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 gradient-mesh-warm" />
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
          ><TextField id="Contact_10">
            Get In Touch
          </TextField></motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight px-2"
          ><TextField id="Contact_11">
            We read every message,</TextField>{" "}
            <span className="text-gradient-gold italic inline-block pb-2"><TextField id="Contact_12">insha'Allah.</TextField></span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="font-dm-sans text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          ><TextField id="Contact_13">
            Whether you have a question, need support, or just want to say salam — we're here.
          </TextField></motion.p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="section-padding warm-surface relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-warm" />
        <div className="absolute inset-0 texture-dots opacity-40 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 — General inquiries */}
            <CardCopies id="contact-email"><motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="glass-card-strong rounded-2xl p-7 flex flex-col gap-5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Mail size={22} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-tight"><TextField id="Contact_14">Say Salam</TextField></h3>
                <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed"><TextField id="Contact_15">
                  For general questions, event info, or anything else — reach out anytime.
                </TextField></p>
              </div>
              <div className="flex flex-col gap-2 mt-auto">
                <LinkField fieldId="Contact_destination_1" href={`mailto:${LINKS.email}`} className="btn-premium text-sm px-5 py-2.5 justify-center"><TextField id="Contact_16">
                  Email us </TextField><ArrowRight size={14} />
                </LinkField>
                <LinkField fieldId="contact-instagram" href={LINKS.instagram} target="_blank" rel="noopener noreferrer"
                  className="btn-premium-secondary text-sm px-5 py-2.5 justify-center"><TextField id="Contact_17">
                  Instagram DM </TextField><ArrowRight size={14} />
                </LinkField>
              </div>
            </motion.div></CardCopies>

            {/* Card 2 — Imam (Sanity-driven) */}
            <CardCopies id="contact-chaplain"><ImamCard /></CardCopies>

            {/* Card 3 — Anonymous feedback */}
            <CardCopies id="contact-feedback"><motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="glass-card-strong rounded-2xl p-7 flex flex-col gap-5"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={22} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-bold text-foreground mb-2 leading-tight"><TextField id="Contact_18">Share Your Thoughts</TextField></h3>
                <p className="font-dm-sans text-muted-foreground text-sm leading-relaxed"><TextField id="Contact_19">
                  Have feedback for the board? We genuinely read every response. Completely anonymous, no login required.
                </TextField></p>
              </div>
              <div className="mt-auto">
                <LinkField fieldId="contact-feedback-form" href={LINKS.anonymousFeedback} target="_blank" rel="noopener noreferrer"
                  className="btn-premium text-sm px-5 py-2.5 w-full justify-center"><TextField id="Contact_20">
                  Leave Feedback </TextField><ArrowRight size={14} />
                </LinkField>
              </div>
            </motion.div></CardCopies>
          </div>

          <p className="text-center text-xs text-muted-foreground/60 font-body mt-8"><TextField id="Contact_21">
            For media or partnership inquiries, please email</TextField>{" "}
            <LinkField fieldId="Contact_destination_2" href={`mailto:${LINKS.email}`} className="text-primary hover:underline"><TextField id="Contact_22">{LINKS.email}</TextField></LinkField>
          </p>
        </div>
      </section>

      {/* Closing — Quran 41:34 (repel evil with what is better) fits Contact (communication context) */}
      <section className="section-padding-sm gradient-section-emerald-soft">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-7">
            <ContentScope id="Contact_23"><ArabicVerse
              arabic="ادْفَعْ بِالَّتِي هِيَ أَحْسَنُ"
              translation="Repel evil with what is better — and you will see one who was your enemy become like a close friend."
              reference="Quran 41:34"
            /></ContentScope>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
