import { LinkField } from "@/editor/content";
import { ContentScope, TextField, itemIdentity, CardCopies } from "@/editor/content";
import { lazy, Suspense, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Building2, Landmark, ExternalLink, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SectionDivider from "@/components/SectionDivider";
import SectionHeading from "@/components/SectionHeading";
import ArabicVerse from "@/components/ArabicVerse";

import { DailyPrayers } from "@/design/DailyPrayers";
import { PageHero } from "@/components/PageHero";
import { PhotoSlots } from "@/design/PhotoSlots";
import BridgeBar from "@/components/BridgeBar";
import { LINKS } from "@/config/links";
import patternImg from "@/assets/geometric-tile.svg";

const SolarAlmanac = lazy(() => import("@/design/SolarAlmanac"));

// ─── Location data ────────────────────────────────────────────────────────────
const oharaMap = "https://www.google.com/maps/dir/?api=1&destination=O%27Hara+Student+Center%2C+4024+O%27Hara+Street%2C+Pittsburgh";
const wpuMap = "https://www.google.com/maps/search/?api=1&query=William+Pitt+Union%2C+3959+Fifth+Avenue%2C+Pittsburgh";
const onCampus = [
  {
    name: "WPU Reflection Room",
    featuredPhoto: 2,
    detail: "3rd floor of the William Pitt Union",
    features: [
      "Prayer mats and prayer attire (thobes, abayas, hijabs) provided.",
      "Ablution stations in both the men's and women's restrooms on the same floor.",
      "2 private bathrooms + showers on this floor.",
      "This is the main spot for daily prayers.",
    ],
  },
  {
    name: "Rec Center Reflection Room",
    featuredPhoto: 1,
    detail: "8th floor, past the bathrooms and behind the double doors",
    features: [
      "Sometimes locked — you may need to ask staff to unlock it.",
      "Private bathrooms with wudu stations adjacent.",
    ],
  },
  {
    name: "Benedum Room 403",
    detail: "Engineering building",
    features: [
      "Equipped with a sink that can be used for wudu.",
      "Can lock from the inside for privacy.",
    ],
  },
  {
    name: "School of Public Health — Room A721",
    detail: "Floor 7, all the way down the hallway from the elevators and to the left",
    features: ["Has a seat and prayer mat."],
  },
];

const masajid = [
  {
    name: "Islamic Center of Pittsburgh (ICP)",
    distance: "~10 minute walk from campus",
    details: [
      "Two Jumu'ah services every Friday (~30 min each):",
      "Arabic Khutba at 12:15 PM",
      "English Jumu'ah at 1:15 PM",
      "See the Jummah section above for Friday prayer on campus.",
    ],
  },
  {
    name: "Attawheed Islamic Center (AIC)",
    distance: "About 5 miles west",
    details: [
      "Two Jumu'ah services: 12:00 PM and 1:10 PM",
      "Founded by Pitt and CMU grad students in 1995.",
      "Several halal restaurants nearby including Afghan Kabab House, Raya's Pizza, Saba, and Rahma Market.",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Prayer = () => {
  const [west, setWest] = useState(false);
  const [almanacOpen, setAlmanacOpen] = useState(false);
  return (
    <Layout names={["Page introduction", "Today’s times", "Jummah Prayer", "On-campus prayer spaces", "Local masajid", "Next steps"]}>
      <PageHero className="prayer-page-hero relative overflow-hidden text-center">
        <div className="absolute inset-0 gradient-mesh-gold pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: `url(${patternImg})`, backgroundSize: "200px" }} />
        <BridgeBar />
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="page-hero-kicker text-xs uppercase tracking-[0.3em] text-primary font-semibold"><TextField id="Prayer_2" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_2"]}>Resources</TextField></p>
          <h1 className="font-display font-bold text-foreground"><TextField id="Prayer_3" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_3"]}>Prayer at </TextField><span className="text-gradient-gold"><TextField id="Prayer_4" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_4"]}>Pitt</TextField></span></h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto"><TextField id="Prayer_5" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_5"]}>Daily times, campus prayer rooms, and Friday prayer.</TextField></p>
        </div>
      </PageHero>
      <section className="prayer-start">
        <div className="site-container prayer-column">
          <Link to="/resources" className="prayer-back"><ArrowLeft size={14}/><TextField id="prayer-resources-back" fallbackFieldKeys={["/resources/prayer-times/PrayerTimes_6"]}>Back to Resources</TextField></Link>
          <DailyPrayers almanac={{
            open: almanacOpen,
            toggle: () => setAlmanacOpen(open => !open),
            chart: almanacOpen && <Suspense fallback={<p role="status">Loading prayer chart…</p>}>
              <SolarAlmanac west={west} setWest={setWest} />
            </Suspense>,
          }} />
        </div>
      </section>

      <SectionDivider />

      {/* ── Jummah Prayer ────────────────────────────────────────── */}
      <section className="section-padding gradient-section-gold-soft relative overflow-hidden">
        <div className="absolute inset-0 texture-dots opacity-50 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <ContentScope id="Prayer_19"><SectionHeading title="Jummah Prayer" label="Every Friday" /></ContentScope>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card-strong rounded-2xl prayer-card"
          >
            <div className="prayer-photo-row jummah-photo-row">
              <div className="prayer-venue-copy">
                <p className="jummah-time"><TextField id="Prayer_20">Every Friday at 2:00 PM</TextField></p>
                <p className="jummah-place"><TextField id="Prayer_21">Usually in the O’Hara Ballroom</TextField></p>
                <LinkField fieldId="jummah-map" href={oharaMap} target="_blank" rel="noopener noreferrer" className="prayer-map">
                  <MapPin size={14}/> Directions <ExternalLink size={12}/>
                </LinkField>
                <p className="text-muted-foreground text-sm mt-2"><TextField id="Prayer_23">Arrive a few minutes early for the khutbah. Check this week’s location before heading over.</TextField></p>
                <div className="jummah-socials">
                  <LinkField fieldId="Prayer_destination_1" href={LINKS.instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram aria-hidden="true" size={15} /> <TextField id="Prayer_25">Instagram Stories</TextField>
                  </LinkField>
                  <LinkField fieldId="Prayer_destination_2" href={LINKS.whatsappAnnouncements} target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" aria-hidden="true" width="15" height="15" fill="currentColor">
                      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.4A8.2 8.2 0 1 1 12 20.2ZM9 7c-.5 0-1.2.7-1.2 1.8 0 1.7 1.6 3.7 3.2 4.9 1.4 1 3.2 1.6 4.2 1.3.9-.3 1.5-1.3 1.5-1.8 0-.2-.2-.3-.4-.4l-1.8-.8c-.3-.1-.5 0-.6.1l-.7.9c-.2.2-.4.2-.7.1a6.2 6.2 0 0 1-3-2.6c-.1-.2 0-.4.1-.5.2-.2.5-.6.5-.8.1-.2 0-.4 0-.6l-.8-1.6C9.2 7 9.1 7 9 7Z" />
                    </svg>
                    <TextField id="Prayer_27">WhatsApp Announcements</TextField>
                  </LinkField>
                </div>
              </div>
              <PhotoSlots name="Jummah prayer" wide/>
            </div>
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      {/* ── On-campus prayer spaces ──────────────────────────────── */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 steps-surface" />
        <div className="absolute inset-0 texture-dots opacity-50" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="gold-gradient w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
              <Building2 className="text-primary-foreground" size={18} />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground"><TextField id="Prayer_29">On-Campus Prayer Spaces</TextField></h2>
          </div>

          <div className="space-y-5">
            {onCampus.map((space, i) => (
              <CardCopies key={space.name} id={"Prayer_30-" + itemIdentity(space, space.name)}><motion.div
                key={space.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="liquid-glass-hover prayer-card rounded-2xl"
              >
                <div className={i === 3 ? undefined : "prayer-photo-row"}>
                <div className="prayer-venue-copy">
                <div className="flex items-start gap-3 mb-2">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground"><TextField id="Prayer_31">{space.name}</TextField></h3>
                    <p className="text-muted-foreground text-sm"><TextField id="Prayer_32">{space.detail}</TextField></p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {space.features.map((f, j) => (
                    <ContentScope key={j} id={"Prayer_33-" + itemIdentity(f, j)}><li key={j} className="text-muted-foreground text-sm leading-relaxed pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-primary/50">
                      <TextField id="Prayer_34">{f}</TextField>
                    </li></ContentScope>
                  ))}
                </ul>
                {i === 0 && <LinkField fieldId="wpu-map" href={wpuMap} target="_blank" rel="noopener noreferrer" className="prayer-map">
                  <MapPin size={14}/> William Pitt Union map <ExternalLink size={12}/>
                </LinkField>}
                </div>
                <PhotoSlots name={space.name} wide publicHidden={i === 3} featured={space.featuredPhoto} />
                </div>
              </motion.div></CardCopies>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Nearby Masajid ───────────────────────────────────────── */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 warm-surface" />
        <div className="absolute inset-0 texture-cross opacity-40" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-secondary w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
              <Landmark className="text-secondary-foreground" size={18} />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground"><TextField id="Prayer_35">Nearby Masajid</TextField></h2>
          </div>

          <div className="space-y-5">
            {masajid.map((m, i) => (
              <CardCopies key={m.name} id={"Prayer_36-" + itemIdentity(m, m.name)}><motion.div
                key={m.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                data-mosque-side={i===0?"left":"right"} className="liquid-glass-hover prayer-card rounded-2xl"
              >
                <div className="mosque-information"><h3 className="font-display text-lg font-bold text-foreground mb-1"><LinkField fieldId="mosque-website" href={i===0?"https://icp-pgh.org":"https://attawheed.org"}><TextField id="Prayer_37">{m.name}</TextField> <ExternalLink size={13} aria-hidden="true" /></LinkField></h3>
                <p className="text-sm text-primary font-semibold mb-3"><TextField id="Prayer_38">{m.distance}</TextField></p>
                <ul className="space-y-1.5">
                  {m.details.map((d, j) => (
                    <ContentScope key={j} id={"Prayer_39-" + itemIdentity(d, j)}><li key={j} className="text-muted-foreground text-sm leading-relaxed pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-primary/50">
                      <TextField id="Prayer_40">{d}</TextField>
                    </li></ContentScope>
                  ))}
                </ul>
                </div>
                <PhotoSlots name={m.name}/>
              </motion.div></CardCopies>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── Closing verse ────────────────────────────────────────── */}
      <section className="section-padding-sm gradient-section-emerald-soft">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong glass-glow p-8 md:p-12">
            <ContentScope id="Prayer_41"><ArabicVerse
              arabic="أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَىٰ غَسَقِ اللَّيْلِ"
              translation="Establish prayer from the decline of the sun to the darkness of the night."
              reference="Quran 17:78"
            /></ContentScope>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Prayer;
